import { useMutation, useQueryClient } from "@tanstack/react-query";
import { VOTE_QUERY_KEYS } from "../queries/querykeys";
import toast from "react-hot-toast";

import { fetcher } from "@/lib/fetcher";
import { VoteRequest } from "@/lib/types";

/**
 * Submits a vote for a specific poll option.
 * @param {object} params - The parameters for the vote submission.
 * @param {number} params.voteId - The ID of the vote.
 * @param {number} params.optionId - The ID of the selected option.
 * @returns {Promise<null>} A promise that resolves when the vote is successfully submitted.
 */
export const submitVote = async ({
  voteId,
  optionId,
}: {
  voteId: number;
  optionId: number;
}) => {
  return fetcher<null>(`/api/votes/${voteId}/vote`, {
    method: "POST",
    body: JSON.stringify({ optionId } as VoteRequest),
  });
};

interface UseVoteMutationParams {
  voteId: number;
}

export function useVoteMutation({ voteId }: UseVoteMutationParams) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ optionId }: { optionId: number }) =>
      submitVote({ voteId, optionId }),
    onSuccess: () => {
      toast.success("투표가 완료되었습니다.");
      // Invalidate and refetch to update the UI
      queryClient.invalidateQueries({
        queryKey: VOTE_QUERY_KEYS.detail(voteId),
      });
      queryClient.invalidateQueries({
        queryKey: VOTE_QUERY_KEYS.feed(),
      });
    },
    onError: (error) => {
      toast.error(error.message || "알 수 없는 오류가 발생했습니다.");
    },
  });
}
