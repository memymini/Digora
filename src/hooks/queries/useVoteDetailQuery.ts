import { useApiQuery } from "../useApiQuery";
import { http } from "@/lib/fetcher";
import { VoteResponse } from "@/lib/types";
import { VOTE_QUERY_KEYS } from "./querykeys";

const getVoteDetail = (voteId: number) => {
  return http.get<VoteResponse>(`/api/votes/${voteId}`);
};

export const useVoteDetailQuery = (voteId: number) => {
  return useApiQuery({
    queryKey: VOTE_QUERY_KEYS.detail(voteId),
    queryFn: () => getVoteDetail(voteId),
    enabled: !!voteId, // Only run the query if voteId is a truthy value
  });
};
