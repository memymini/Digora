import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { VOTE_ADMIN_QUERY_KEY } from "../queries/useAdminVotesQuery";
import { http } from "@/lib/fetcher";
import { CreateVoteRequest } from "@/types";

export const createVote = async (payload: CreateVoteRequest) => {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("details", payload.details);
  formData.append("ends_at", payload.ends_at);

  payload.options.forEach((option, index) => {
    formData.append(`options[${index}][name]`, option.name);
    formData.append(`options[${index}][descriptions]`, option.descriptions);
    formData.append(`options[${index}][file]`, option.file);
  });

  return http.post<null>("/api/admin/votes", formData);
};

export const useCreateVoteMutation = () => {
  const queryClient = useQueryClient();

  return useApiMutation((payload: CreateVoteRequest) => createVote(payload), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOTE_ADMIN_QUERY_KEY });
    },
  });
};
