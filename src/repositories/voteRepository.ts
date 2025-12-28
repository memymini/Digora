import { SupabaseClient } from "@supabase/supabase-js";

export const voteRepository = {
  async getVoteById(client: SupabaseClient, voteId: number) {
    const { data, error } = await client
      .from("votes")
      .select("id, title, status, ends_at, details")
      .eq("id", voteId)
      .single();

    return { data, error };
  },

  async getVoteDetailsRpc(client: SupabaseClient, voteId: number) {
    const { data, error } = await client.rpc("get_vote_details", {
      p_vote_id: voteId,
    });
    return { data, error };
  },

  async getUserBallot(client: SupabaseClient, voteId: number, userId: string) {
    const { data, error } = await client
      .from("ballots")
      .select("option_id")
      .eq("vote_id", voteId)
      .eq("user_id", userId)
      .maybeSingle();

    return { data, error };
  },

  async getOngoingVotes(client: SupabaseClient, limit: number = 1) {
    const { data, error } = await client
      .from("votes")
      .select("id, title, details, status, ends_at")
      .eq("status", "ongoing")
      .order("starts_at", { ascending: false })
      .limit(limit);

    return { data, error };
  },

  async getVoteFeedRpc(client: SupabaseClient) {
    const { data, error } = await client.rpc("get_vote_feed");
    return { data, error };
  },

  async castBallot(
    client: SupabaseClient,
    voteId: number,
    userId: string,
    optionId: number
  ) {
    const { error } = await client.from("ballots").insert({
      user_id: userId,
      vote_id: voteId,
      option_id: optionId,
      created_at: new Date().toISOString(),
    });

    return { error };
  },

  async getDailyVoteCount(client: SupabaseClient, userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count, error } = await client
      .from("ballots")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", today.toISOString());

    return { count, error };
  },
};

