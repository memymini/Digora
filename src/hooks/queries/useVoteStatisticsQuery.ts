import { useApiQuery } from "../useApiQuery";
import { http } from "@/lib/fetcher";
import { Statistics } from "@/types";
import { VOTE_QUERY_KEYS } from "./querykeys";

const getVoteStatistics = (voteId: number) => {
  return http.get<Statistics>(`/api/votes/${voteId}/statistics`);
};

export const useVoteStatisticsQuery = (voteId: number) => {
  return useApiQuery({
    queryKey: VOTE_QUERY_KEYS.statistics(voteId),
    queryFn: () => getVoteStatistics(voteId),
    enabled: !!voteId, // Only run the query if voteId is a truthy value
  });
};
