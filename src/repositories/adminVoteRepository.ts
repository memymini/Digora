import { SupabaseClient } from "@supabase/supabase-js";

export const adminVoteRepository = {
  async getAllVotes(client: SupabaseClient) {
    const { data, error } = await client
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

    return { data, error };
  },

  async getProfile(client: SupabaseClient, userId: string) {
    const { data, error } = await client
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    return { data, error };
  },

  async insertVote(client: SupabaseClient, voteData: Record<string, unknown>) {
    const { data, error } = await client
      .from("votes")
      .insert(voteData)
      .select()
      .single();
    return { data, error };
  },

  async insertVoteOptions(
    client: SupabaseClient,
    options: Record<string, unknown>[]
  ) {
    const { error } = await client.from("vote_options").insert(options);
    return { error };
  },

  async deleteVote(client: SupabaseClient, voteId: number) {
    const { error } = await client
      .from("votes")
      .delete()
      .match({ id: voteId });
    return { error };
  },

  async updateVote(
    client: SupabaseClient,
    voteId: string,
    updateData: Record<string, unknown>
  ) {
    const { error } = await client
      .from("votes")
      .update(updateData)
      .eq("id", voteId);
    return { error };
  },

  async updateVoteOption(
    client: SupabaseClient,
    optionId: number,
    updateData: Record<string, unknown>
  ) {
    const { error } = await client
      .from("vote_options")
      .update(updateData)
      .eq("id", optionId);
    return { error };
  },

  async uploadImage(client: SupabaseClient, file: File, fileName: string) {
    const { data, error } = await client.storage
      .from("vote-images")
      .upload(fileName, file);

    if (error) return { data: null, error };

    const { data: urlData } = client.storage
      .from("vote-images")
      .getPublicUrl(data.path);

    return { data: urlData, error: null };
  },
};
