import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/fetcher';
import { VoteResponse } from '@/lib/types';
import { VOTE_QUERY_KEYS } from './querykeys';

const getVoteDetail = (voteId: number) => {
  return fetcher<VoteResponse>(`/api/votes/${voteId}`);
};

export const useVoteDetailQuery = (voteId: number) => {
  return useQuery({
    queryKey: VOTE_QUERY_KEYS.detail(voteId),
    queryFn: () => getVoteDetail(voteId),
    enabled: !!voteId, // Only run the query if voteId is a truthy value
  });
};
