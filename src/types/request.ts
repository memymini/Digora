export interface CreateProfileRequest {
  id: string;
  kakao_user_id: string;
  display_name: string;
  role: string;
  gender: string;
  age_group: string;
  birth_year: string;
}

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
