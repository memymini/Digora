import { useQuery } from "@tanstack/react-query";
import { VoteWithOption } from "@/lib/types";
import { getAdminVotes } from "@/services/adminVoteService";

export const VOTE_ADMIN_QUERY_KEY = ["admin", "votes"];

export const useAdminVotesQuery = () => {
  return useQuery<VoteWithOption[], Error>({ 
    queryKey: VOTE_ADMIN_QUERY_KEY,
    queryFn: getAdminVotes 
  });
};