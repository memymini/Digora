import { http } from "@/lib/fetcher";
import { VoteWithOption } from "@/lib/types";

// =============================================
// Types
// =============================================
export interface CreateVotePayload {
  title: string;
  details: string;
  ends_at: string;
  candidateAFile: File;
  candidateBFile: File;
  candidateAName: string;
  candidateBName: string;
}

export interface UpdateVotePayload {
  voteId: number;
  title: string;
  details: string;
  ends_at: string;
  options: {
    id: number;
    candidate_name: string;
    file?: File | null;
  }[];
}

// =============================================
// Service Functions
// =============================================

export const getAdminVotes = async (): Promise<VoteWithOption[]> => {
  return http.get<VoteWithOption[]>("/api/admin/votes");
};

export const updateVote = async (payload: UpdateVotePayload): Promise<null> => {
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

export const deleteVote = async (voteId: number): Promise<null> => {
  return http.delete<null>(`/api/admin/votes/${voteId}`);
};

export const createVote = async (payload: CreateVotePayload) => {
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
