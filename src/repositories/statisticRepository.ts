import { SupabaseClient } from "@supabase/supabase-js";

export const statisticRepository = {
  async getBallots(client: SupabaseClient, voteId: number) {
    const { data, error } = await client
      .from("ballots")
      .select(
        `
        created_at,
        option_id,
        profiles ( age_group, gender )
      `
      )
      .eq("vote_id", voteId);

    return { data, error };
  },

  async getOptions(client: SupabaseClient, voteId: number) {
    const { data, error } = await client
      .from("vote_options")
      .select("id, candidate_name")
      .eq("vote_id", voteId);

    return { data, error };
  },

  async getCommentCount(client: SupabaseClient, voteId: number) {
    const { count, error } = await client
      .from("comments")
      .select("id", { count: "exact" })
      .eq("vote_id", voteId);

    return { count, error };
  },
};
