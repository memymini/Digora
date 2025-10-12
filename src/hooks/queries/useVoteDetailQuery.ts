import { useApiQuery } from "../useApiQuery";
import { http } from "@/lib/fetcher";
import { VoteDetails } from "@/types";
import { VOTE_QUERY_KEYS } from "./querykeys";

const getVoteDetail = (voteId: number) => {
  return http.get<VoteDetails>(`/api/votes/${voteId}`);
};

export const useVoteDetailQuery = (voteId: number) => {
  return useApiQuery({
    queryKey: VOTE_QUERY_KEYS.detail(voteId),
    queryFn: () => getVoteDetail(voteId),
    enabled: !!voteId, // Only run the query if voteId is a truthy value
  });
};
