import { ReportCommentRequest } from "@/lib/types";
import { useApiMutation } from "../useApiMutation";
import { http } from "@/lib/fetcher";

const reportComment = async ({
  voteId,
  commentId,
  reason,
}: {
  voteId: number;
  commentId: number;
  reason: string;
}) => {
  return http.post<null>(`/api/votes/${voteId}/comments/report`, {
    commentId,
    reason,
  });
};

export const useReportCommentMutation = () => {
  return useApiMutation(
    ({
      voteId,
      commentId,
      reason,
    }: {
      voteId: number;
      commentId: number;
      reason: string;
    }) => reportComment({ voteId, commentId, reason })
  );
};
