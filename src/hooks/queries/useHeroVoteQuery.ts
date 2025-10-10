import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/fetcher";
import { ApiResponse, VoteResponse } from "@/lib/types";
import { VOTE_QUERY_KEYS } from "./querykeys";

const getHeroVote = () => {
  return http.get<VoteResponse | null>("/api/votes/hero");
};

export const useHeroVoteQuery = () => {
  return useQuery({
    queryKey: VOTE_QUERY_KEYS.hero(),
    queryFn: getHeroVote,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
