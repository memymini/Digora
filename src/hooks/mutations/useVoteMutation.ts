import { useQueryClient } from "@tanstack/react-query";
import { VOTE_QUERY_KEYS } from "../queries/querykeys";
import toast from "react-hot-toast";
import { http } from "@/lib/fetcher";
import { useApiMutation } from "../useApiMutation";
import { useRouter } from "next/navigation";

export const submitVote = async ({
  voteId,
  optionId,
}: {
  voteId: number;
  optionId: number;
}) => {
  return http.post<null>(`/api/votes/${voteId}`, {
    optionId,
  });
};

interface VoteMutationParams {
  voteId: number;
}

export function useVoteMutation({ voteId }: VoteMutationParams) {
  const queryClient = useQueryClient();
  //const router = useRouter();
  return useApiMutation(
    ({ optionId }: { optionId: number }) => submitVote({ voteId, optionId }),
    {
      onSuccess: () => {
        toast.success("투표가 완료되었습니다.");
        queryClient.invalidateQueries({
          queryKey: VOTE_QUERY_KEYS.detail(voteId),
        });
        queryClient.invalidateQueries({ queryKey: VOTE_QUERY_KEYS.feed() });
        // router.push(`/result/${voteId}`);
      },
    }
  );
}
