import { adminVotesMapper } from "@/utils/mappers";
import { createClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

export const adminVoteService = {
  async getAllVotes() {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("votes")
      .select(
        `
        id,
        title,
        details,
        status,
        ends_at,
        vote_options (
          id,
          candidate_name,
          party,
          image_path,
          descriptions
        )
      `
      )
      .order("id", { ascending: false });

    if (error) throw new Error(error.message);

    // ✅ mapper 적용
    return adminVotesMapper(data);
  },

  async uploadImage(supabase: SupabaseClient, file: File) {
    if (!file || file.size === 0) throw new Error("Image file is required.");
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from("vote-images")
      .upload(fileName, file);
    if (error) throw new Error(error.message);

    const { data: urlData } = supabase.storage
      .from("vote-images")
      .getPublicUrl(data.path);
    return urlData.publicUrl;
  },

  async createVote(
    supabase: SupabaseClient,
    userId: string,
    formData: FormData
  ) {
    try {
      // 관리자 권한 확인
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (profileError || !profile) throw new Error("Profile not found.");
      if (profile.role !== "admin") throw new Error("User is not admin.");

      // 폼 데이터 파싱
      const title = formData.get("title") as string;
      const details = formData.get("details") as string;
      const ends_at = formData.get("ends_at") as string;

      const options: { name: string; descriptions: string; file: File }[] = [];
      for (const [key, value] of formData.entries()) {
        const match = key.match(
          /^options\[(\d+)\]\[(name|descriptions|file)\]$/
        );
        if (match) {
          const index = parseInt(match[1], 10);
          const field = match[2];
          if (!options[index]) {
            options[index] = { name: "", descriptions: "", file: null! };
          }
          if (field === "file") {
            options[index][field] = value as File;
          } else {
            options[index][field] = value as string;
          }
        }
      }

      // 투표 생성
      const { data: voteData, error: voteError } = await supabase
        .from("votes")
        .insert({
          title,
          details,
          starts_at: new Date().toISOString(),
          ends_at,
          status: "ongoing",
        })
        .select()
        .single();

      if (voteError || !voteData) {
        console.error("[createVote] Error inserting vote:", voteError);
        throw new Error("Failed to create vote.");
      }

      // Upload images and prepare options for insertion
      const optionsToInsert = await Promise.all(
        options.map(async (option) => {
          const imageUrl = await this.uploadImage(supabase, option.file);
          return {
            vote_id: voteData.id,
            candidate_name: option.name,
            descriptions: option.descriptions
              .split(/\r?\n/)
              .filter((line) => line.trim() !== ""),
            image_path: imageUrl,
            party: null,
          };
        })
      );

      const { error: optionsError } = await supabase
        .from("vote_options")
        .insert(optionsToInsert);

      if (optionsError) {
        console.error(
          "[createVote] Error inserting vote options:",
          optionsError
        );
        throw new Error(optionsError.message);
      }
      return voteData;
    } catch (error) {
      throw error; // Re-throw the error to be handled by the calling route
    }
  },
  async deleteVote(supabase: SupabaseClient, id: string) {
    const voteId = parseInt(id, 10);
    const { error } = await supabase
      .from("votes")
      .delete()
      .match({ id: voteId });
    if (error) throw new Error(error.message);
    return { message: "Vote deleted successfully." };
  },
  async updateVote(
    supabase: SupabaseClient,
    voteId: string,
    formData: FormData
  ) {
    const title = formData.get("title") as string;
    const details = formData.get("details") as string;
    const ends_at = formData.get("ends_at") as string;

    const { error: voteUpdateError } = await supabase
      .from("votes")
      .update({ title, details, ends_at })
      .eq("id", voteId);
    if (voteUpdateError) throw new Error(voteUpdateError.message);

    // Parse dynamic options from FormData
    const options: {
      id: string;
      name: string;
      descriptions: string;
      file?: File;
    }[] = [];
    for (const [key, value] of formData.entries()) {
      const match = key.match(
        /^options\[(\d+)\]\[(id|name|descriptions|file)\]$/
      );
      if (match) {
        const index = parseInt(match[1], 10);
        const field = match[2];
        if (!options[index]) {
          options[index] = { id: "", name: "", descriptions: "" };
        }
        if (field === "file" && (value as File).size > 0) {
          options[index][field] = value as File;
        } else if (field !== "file") {
          options[index][field as "id" | "name" | "descriptions"] =
            value as string;
        }
      }
    }

    // Update options
    const updatePromises = options.map(async (option) => {
      const optionId = parseInt(option.id, 10);
      const updateData: {
        candidate_name: string;
        descriptions: string[];
        image_path?: string;
      } = {
        candidate_name: option.name,
        descriptions: option.descriptions
          .split(/\r?\n/)
          .filter((line) => line.trim() !== ""),
      };

      if (option.file) {
        const imageUrl = await this.uploadImage(supabase, option.file);
        updateData.image_path = imageUrl;
      }

      const { error } = await supabase
        .from("vote_options")
        .update(updateData)
        .eq("id", optionId);

      if (error)
        throw new Error(
          `Failed to update option ${optionId}: ${error.message}`
        );
    });

    await Promise.all(updatePromises);

    return { message: "Vote updated successfully." };
  },
};
