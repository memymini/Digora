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
          image_path
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
    const candidateAFile = formData.get("candidateAFile") as File;
    const candidateBFile = formData.get("candidateBFile") as File;
    const candidateAName = formData.get("candidateAName") as string;
    const candidateBName = formData.get("candidateBName") as string;

    const [candidateAUrl, candidateBUrl] = await Promise.all([
      this.uploadImage(supabase, candidateAFile),
      this.uploadImage(supabase, candidateBFile),
    ]);

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

    if (voteError || !voteData) throw new Error("Failed to create vote.");

    const optionsToInsert = [
      {
        vote_id: voteData.id,
        candidate_name: candidateAName || "후보 1",
        image_path: candidateAUrl,
      },
      {
        vote_id: voteData.id,
        candidate_name: candidateBName || "후보 2",
        image_path: candidateBUrl,
      },
    ];

    const { error: optionsError } = await supabase
      .from("vote_options")
      .insert(optionsToInsert);
    if (optionsError) throw new Error(optionsError.message);

    return voteData;
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
  async updateVote(supabase: SupabaseClient, id: string, formData: FormData) {
    const voteId = parseInt(id, 10);
    const title = formData.get("title") as string;
    const details = formData.get("details") as string;
    const ends_at = formData.get("ends_at") as string;

    const { error: voteUpdateError } = await supabase
      .from("votes")
      .update({ title, details, ends_at })
      .eq("id", voteId);
    if (voteUpdateError) throw new Error(voteUpdateError.message);

    // Candidate A update
    const candidateAId = formData.get("candidateAId") as string;
    const candidateAName = formData.get("candidateAName") as string;
    const candidateAFile = formData.get("candidateAFile") as File | null;
    const candidateAUpdateData: {
      candidate_name: string;
      image_path?: string;
    } = {
      candidate_name: candidateAName,
    };
    if (candidateAFile && candidateAFile.size > 0) {
      const candidateAImageUrl = await this.uploadImage(
        supabase,
        candidateAFile
      );
      if (candidateAImageUrl) {
        candidateAUpdateData.image_path = candidateAImageUrl;
      }
    }

    const { error: candidateAError } = await supabase
      .from("vote_options")
      .update(candidateAUpdateData)
      .eq("id", candidateAId);
    if (candidateAError) throw new Error(candidateAError.message);

    // Candidate B update
    const candidateBId = formData.get("candidateBId") as string;
    const candidateBName = formData.get("candidateBName") as string;
    const candidateBFile = formData.get("candidateBFile") as File | null;
    const candidateBUpdateData: {
      candidate_name: string;
      image_path?: string;
    } = {
      candidate_name: candidateBName,
    };
    if (candidateBFile && candidateBFile.size > 0) {
      const candidateBImageUrl = await this.uploadImage(
        supabase,
        candidateBFile
      );
      if (candidateBImageUrl) {
        candidateBUpdateData.image_path = candidateBImageUrl;
      }
    }

    const { error: candidateBError } = await supabase
      .from("vote_options")
      .update(candidateBUpdateData)
      .eq("id", candidateBId);
    if (candidateBError) throw new Error(candidateBError.message);

    return { message: "Vote updated successfully." };
  },
};
