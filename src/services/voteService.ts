import { SupabaseClient } from "@supabase/supabase-js";
import { voteRepository } from "@/repositories/voteRepository";

export const voteService = {
  async getHeroVote(client: SupabaseClient) {
    const { data: votes, error: voteError } =
      await voteRepository.getOngoingVotes(client, 1);

    if (voteError) {
      if (voteError.code === "PGRST116") return null;
      throw new Error(`DB_ERROR: ${voteError.message}`);
    }

    const vote = votes?.[0];
    if (!vote) return null;

    const { data: rpcData, error: rpcError } =
      await voteRepository.getVoteDetailsRpc(client, vote.id);

    if (rpcError) throw new Error(`DB_ERROR: ${rpcError.message}`);
    return {
      ...vote,
      total_count: rpcData?.[0]?.total_count ?? 0,
      options: rpcData?.[0]?.options ?? [],
    };
  },

  async getVoteFeed(client: SupabaseClient) {
    const { data, error } = await voteRepository.getVoteFeedRpc(client);

    if (error) {
      console.error("Supabase RPC error:", error);
      throw new Error(error.message);
    }

    return data ?? [];
  },

  async getVoteDetails(
    client: SupabaseClient,
    voteId: number,
    userId?: string
  ) {
    const [voteRes, rpcRes, userVoteRes] = await Promise.all([
      voteRepository.getVoteById(client, voteId),
      voteRepository.getVoteDetailsRpc(client, voteId),
      userId
        ? voteRepository.getUserBallot(client, voteId, userId)
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

  async handleVote(
    client: SupabaseClient,
    userId: string,
    voteId: number,
    optionId: number
  ) {
    const { data: vote, error: voteError } = await voteRepository.getVoteById(
      client,
      voteId
    );

    if (voteError) throw voteError;
    if (!vote) throw new Error("NOT_FOUND");
    if (vote.status !== "ongoing") throw new Error("VOTE_NOT_ONGOING");

    const { error: ballotError } = await voteRepository.castBallot(
      client,
      voteId,
      userId,
      optionId
    );

    if (ballotError?.code === "23505") throw new Error("ALREADY_VOTED");
    if (ballotError) throw ballotError;

    return { success: true };
  },
};
