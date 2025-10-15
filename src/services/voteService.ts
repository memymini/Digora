import { createClient } from "@/lib/supabase/server";
export const voteService = {
  async getHeroVote() {
    const supabase = await createClient();

    const { data: vote, error: voteError } = await supabase
      .from("votes")
      .select("id, title, details,status, ends_at")
      .eq("status", "ongoing")
      .order("starts_at", { ascending: false })
      .limit(1)
      .single();

    if (voteError) {
      if (voteError.code === "PGRST116") return null;
      throw new Error(`DB_ERROR: ${voteError.message}`);
    }

    if (!vote) return null;
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "get_vote_details",
      {
        p_vote_id: vote.id,
      }
    );

    if (rpcError) throw new Error(`DB_ERROR: ${rpcError.message}`);
    return {
      ...vote,
      total_count: rpcData?.[0]?.total_count ?? 0,
      options: rpcData?.[0]?.options ?? [],
    };
  },

  async getVoteFeed() {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_vote_feed");

    if (error) {
      console.error("Supabase RPC error:", error);
      throw new Error(error.message);
    }

    return data ?? [];
  },
  async getVoteDetails(voteId: number, userId?: string) {
    const supabase = await createClient();

    const [voteRes, rpcRes, userVoteRes] = await Promise.all([
      supabase
        .from("votes")
        .select("id, title, status, ends_at, details")
        .eq("id", voteId)
        .single(),
      supabase.rpc("get_vote_details", { p_vote_id: voteId }),
      userId
        ? supabase
            .from("ballots")
            .select("option_id")
            .eq("vote_id", voteId)
            .eq("user_id", userId)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    const { data: vote, error: voteError } = voteRes;
    if (voteError) throw voteError;
    if (!vote) return null;

    const { data: rpcData, error: rpcError } = rpcRes;
    if (rpcError) throw rpcError;

    const { data: userVote, error: userVoteError } = userVoteRes;
    if (userVoteError && userVoteError.code !== "PGRST116") {
      throw userVoteError;
    }
    const userVotedOptionId = userVote?.option_id ?? null;
    const userVoted = Boolean(userVotedOptionId);
    return {
      ...vote,
      total_count: rpcData?.[0]?.total_count ?? 0,
      is_user_voted: userVoted,
      option_id: userVotedOptionId,
      options: rpcData?.[0]?.options ?? [],
    };
  },

  async handleVote(userId: string, voteId: number, optionId: number) {
    const supabase = await createClient();

    const { data: vote, error: voteError } = await supabase
      .from("votes")
      .select("status")
      .eq("id", voteId)
      .single();

    if (voteError) throw voteError;
    if (!vote) throw new Error("NOT_FOUND");
    if (vote.status !== "ongoing") throw new Error("VOTE_NOT_ONGOING");

    const { error: ballotError } = await supabase.from("ballots").insert({
      user_id: userId,
      vote_id: voteId,
      option_id: optionId,
      created_at: new Date().toISOString(),
    });

    if (ballotError?.code === "23505") throw new Error("ALREADY_VOTED");
    if (ballotError) throw ballotError;

    return { success: true };
  },
};
