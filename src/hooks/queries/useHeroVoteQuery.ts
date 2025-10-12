import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/fetcher";
import { HeroVote } from "@/types";
import { VOTE_QUERY_KEYS } from "./querykeys";

const getHeroVote = () => {
  return http.get<HeroVote | null>("/api/votes/hero");
};

export const useHeroVoteQuery = () => {
  return useQuery({
    queryKey: VOTE_QUERY_KEYS.hero(),
    queryFn: getHeroVote,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
