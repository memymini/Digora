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

  const [candidateA, candidateB] = options;
  formData.append("candidateAId", candidateA.id.toString());
  formData.append("candidateAName", candidateA.candidate_name);
  if (candidateA.file) {
    formData.append("candidateAFile", candidateA.file);
  }

  formData.append("candidateBId", candidateB.id.toString());
  formData.append("candidateBName", candidateB.candidate_name);
  if (candidateB.file) {
    formData.append("candidateBFile", candidateB.file);
  }

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
