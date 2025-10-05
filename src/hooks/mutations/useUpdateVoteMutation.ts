import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { VOTE_ADMIN_QUERY_KEY } from "../queries/useAdminVotesQuery";
import {
  updateVote,
  UpdateVotePayload,
} from "@/services/adminVoteService";

export const useUpdateVoteMutation = () => {
  const queryClient = useQueryClient();

  return useApiMutation((payload: UpdateVotePayload) => updateVote(payload), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOTE_ADMIN_QUERY_KEY });
    },
  });
};