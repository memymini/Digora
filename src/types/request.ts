export interface VoteRequest {
  optionId: number;
}

export interface ReportCommentRequest {
  voteId: number;
  commentId: number;
  reason: string;
}

export interface CreateVoteRequest {
  title: string;
  details: string;
  ends_at: string;
  candidateAFile: File;
  candidateBFile: File;
  candidateAName: string;
  candidateBName: string;
}

export interface UpdateVoteRequest {
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
