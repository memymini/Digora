import { useApiQuery } from "../useApiQuery";
import { http } from "@/lib/fetcher";
import { StatisticResponse } from "@/lib/types";
import { VOTE_QUERY_KEYS } from "./querykeys";

const getVoteStatistics = (voteId: number) => {
  return http.get<StatisticResponse>(`/api/votes/${voteId}/statistics`);
};

export const useVoteStatisticsQuery = (voteId: number) => {
  return useApiQuery({
    queryKey: VOTE_QUERY_KEYS.statistics(voteId),
    queryFn: () => getVoteStatistics(voteId),
    enabled: !!voteId, // Only run the query if voteId is a truthy value
  });
};
