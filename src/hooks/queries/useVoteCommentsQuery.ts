import { useApiQuery } from "../useApiQuery";
import { http } from "@/lib/fetcher";
import { CommentsApiResponse } from "@/lib/types";
import { VOTE_QUERY_KEYS } from "./querykeys";

const getVoteComments = (voteId: number) => {
  return http.get<CommentsApiResponse>(`/api/votes/${voteId}/comments`);
};

export const useVoteCommentsQuery = (voteId: number) => {
  return useApiQuery({
    queryKey: VOTE_QUERY_KEYS.comments(voteId),
    queryFn: () => getVoteComments(voteId),
    enabled: !!voteId, // Only run the query if voteId is a truthy value
  });
};
