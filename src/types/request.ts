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
  options: {
    name: string;
    descriptions?: string;
    file: File;
  }[];
}

export interface UpdateVoteRequest {
  voteId: number;
  title: string;
  details: string;
  ends_at: string;
  options: {
    id: number;
    candidate_name: string;
    descriptions?: string;
    file?: File | null;
  }[];
}
