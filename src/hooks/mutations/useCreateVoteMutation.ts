import { useApiMutation } from "../useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { VOTE_ADMIN_QUERY_KEY } from "../queries/useAdminVotesQuery";
import { http } from "@/lib/fetcher";
import { CreateVoteRequest } from "@/lib/types";

export const createVote = async (payload: CreateVoteRequest) => {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("details", payload.details);
  formData.append("ends_at", payload.ends_at);
  formData.append("candidateAName", payload.candidateAName);
  formData.append("candidateBName", payload.candidateBName);
  formData.append("candidateAFile", payload.candidateAFile);
  formData.append("candidateBFile", payload.candidateBFile);

  // Note: The http.post function in fetcher.ts should handle FormData correctly.
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
