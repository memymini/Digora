import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { VoteFeedResponse } from "@/lib/types";
import { VOTE_QUERY_KEYS } from "./querykeys";

const getVoteFeed = () => {
  return fetcher<VoteFeedResponse[]>("/api/votes/feed");
};

export const useVoteFeedQuery = () => {
  return useQuery({
    queryKey: VOTE_QUERY_KEYS.feed(),
    queryFn: getVoteFeed,
  });
};
