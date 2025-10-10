import { useApiQuery } from "../useApiQuery";
import { http } from "@/lib/fetcher";
import { VoteFeedResponse } from "@/lib/types";
import { VOTE_QUERY_KEYS } from "./querykeys";

const getVoteFeed = () => {
  return http.get<VoteFeedResponse[]>("/api/votes/feed");
};

export const useVoteFeedQuery = () => {
  return useApiQuery({
    queryKey: VOTE_QUERY_KEYS.feed(),
    queryFn: getVoteFeed,
  });
};
