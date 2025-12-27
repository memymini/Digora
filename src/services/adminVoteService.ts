import { adminVotesMapper } from "@/utils/mappers";
import { SupabaseClient } from "@supabase/supabase-js";
import { adminVoteRepository } from "@/repositories/adminVoteRepository";

export const adminVoteService = {
  async getAllVotes(client: SupabaseClient) {
    const { data, error } = await adminVoteRepository.getAllVotes(client);

    if (error) throw new Error(error.message);

    // ✅ mapper 적용
    return adminVotesMapper(data || []);
  },

  async uploadImage(client: SupabaseClient, file: File) {
    if (!file || file.size === 0) throw new Error("Image file is required.");
    const fileName = `${Date.now()}_${file.name}`;

    const { data, error } = await adminVoteRepository.uploadImage(
      client,
      file,
      fileName
    );

    if (error) throw new Error(error.message);
    return data!.publicUrl;
  },

  async createVote(
    client: SupabaseClient,
    userId: string,
    formData: FormData
  ) {
    try {
      // 관리자 권한 확인
      const { data: profile, error: profileError } =
        await adminVoteRepository.getProfile(client, userId);

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
      const { data: voteData, error: voteError } =
        await adminVoteRepository.insertVote(client, {
          title,
          details,
          starts_at: new Date().toISOString(),
          ends_at,
          status: "ongoing",
        });

      if (voteError || !voteData) {
        console.error("[createVote] Error inserting vote:", voteError);
        throw new Error("Failed to create vote.");
      }

      // Upload images and prepare options for insertion
      const optionsToInsert = await Promise.all(
        options.map(async (option) => {
          const imageUrl = await this.uploadImage(client, option.file);
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

      const { error: optionsError } =
        await adminVoteRepository.insertVoteOptions(client, optionsToInsert);

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
  async deleteVote(client: SupabaseClient, id: string) {
    const voteId = parseInt(id, 10);
    const { error } = await adminVoteRepository.deleteVote(client, voteId);

    if (error) throw new Error(error.message);
    return { message: "Vote deleted successfully." };
  },
  async updateVote(
    client: SupabaseClient,
    voteId: string,
    formData: FormData
  ) {
    const title = formData.get("title") as string;
    const details = formData.get("details") as string;
    const ends_at = formData.get("ends_at") as string;

    const { error: voteUpdateError } = await adminVoteRepository.updateVote(
      client,
      voteId,
      { title, details, ends_at }
    );
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
        const imageUrl = await this.uploadImage(client, option.file);
        updateData.image_path = imageUrl;
      }

      const { error } = await adminVoteRepository.updateVoteOption(
        client,
        optionId,
        updateData
      );

      if (error)
        throw new Error(
          `Failed to update option ${optionId}: ${error.message}`
        );
    });

    await Promise.all(updatePromises);

    return { message: "Vote updated successfully." };
  },
};
