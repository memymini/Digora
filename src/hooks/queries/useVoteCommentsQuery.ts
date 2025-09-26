import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/fetcher';
import { CommentResponse } from '@/lib/types';
import { VOTE_QUERY_KEYS } from './querykeys';

const getVoteComments = (voteId: number) => {
  return fetcher<CommentResponse[]>(`/api/votes/${voteId}/comments`);
};

export const useVoteCommentsQuery = (voteId: number) => {
  return useQuery({
    queryKey: VOTE_QUERY_KEYS.comments(voteId),
    queryFn: () => getVoteComments(voteId),
    enabled: !!voteId, // Only run the query if voteId is a truthy value
  });
};
