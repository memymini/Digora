import { useQueryClient } from "@tanstack/react-query";
import { VOTE_QUERY_KEYS } from "../queries/querykeys";
import toast from "react-hot-toast";
import { http } from "@/lib/fetcher";
import { VoteRequest } from "@/lib/types";
import { useApiMutation } from "../useApiMutation";

export const submitVote = async ({
  voteId,
  optionId,
}: {
  voteId: number;
  optionId: number;
}) => {
  return http.post<null>(`/api/votes/${voteId}/vote`, {
    optionId,
  } as VoteRequest);
};

interface UseVoteMutationParams {
  voteId: number;
}

export function useVoteMutation({ voteId }: UseVoteMutationParams) {
  const queryClient = useQueryClient();

  return useApiMutation(
    ({ optionId }: { optionId: number }) => submitVote({ voteId, optionId }),
    {
      onSuccess: () => {
        toast.success("투표가 완료되었습니다.");
        queryClient.invalidateQueries({
          queryKey: VOTE_QUERY_KEYS.detail(voteId),
        });
        queryClient.invalidateQueries({ queryKey: VOTE_QUERY_KEYS.feed() });
      },
    }
  );
}
