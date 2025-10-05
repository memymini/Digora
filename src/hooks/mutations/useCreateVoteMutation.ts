import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { VOTE_ADMIN_QUERY_KEY } from "../queries/useAdminVotesQuery";
import { createVote, CreateVotePayload } from "@/services/adminVoteService";

export const useCreateVoteMutation = () => {
  const queryClient = useQueryClient();

  return useApiMutation((payload: CreateVotePayload) => createVote(payload), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOTE_ADMIN_QUERY_KEY });
    },
  });
};
