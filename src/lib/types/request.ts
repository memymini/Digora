export interface VoteRequest {
  optionId: number;
}

export interface ReportCommentRequest {
  voteId: number;
  commentId: number;
  reason: string;
}
