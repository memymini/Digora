import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { VOTE_ADMIN_QUERY_KEY } from "../queries/useAdminVotesQuery";
import { http } from "@/lib/fetcher";

export const deleteVote = async (voteId: number): Promise<null> => {
  return http.delete<null>(`/api/admin/votes/${voteId}`);
};

export const useDeleteVoteMutation = () => {
  const queryClient = useQueryClient();

  return useApiMutation((voteId: number) => deleteVote(voteId), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOTE_ADMIN_QUERY_KEY });
    },
  });
};
