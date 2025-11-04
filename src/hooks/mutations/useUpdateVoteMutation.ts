import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { VOTE_ADMIN_QUERY_KEY } from "../queries/useAdminVotesQuery";
import { http } from "@/lib/fetcher";
import { UpdateVoteRequest } from "@/types";

export const updateVote = async (payload: UpdateVoteRequest): Promise<null> => {
  const { voteId, title, details, ends_at, options } = payload;
  const formData = new FormData();
  formData.append("title", title);
  formData.append("details", details);
  formData.append("ends_at", ends_at);

  options.forEach((option, index) => {
    formData.append(`options[${index}][id]`, option.id.toString());
    formData.append(`options[${index}][name]`, option.candidate_name);
    formData.append(`options[${index}][descriptions]`, option.descriptions || '');
    if (option.file) {
      formData.append(`options[${index}][file]`, option.file);
    }
  });

  return http.post<null>(`/api/admin/votes/${voteId}`, formData);
};

export const useUpdateVoteMutation = () => {
  const queryClient = useQueryClient();

  return useApiMutation((payload: UpdateVoteRequest) => updateVote(payload), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOTE_ADMIN_QUERY_KEY });
    },
  });
};
