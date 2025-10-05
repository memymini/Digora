import { useApiMutation } from "../useApiMutation";
import { http } from "@/lib/fetcher";

interface ReportCommentPayload {
  commentId: number;
  reason: string;
}

const reportComment = async ({ commentId, reason }: ReportCommentPayload) => {
  return http.post<null>(`/api/comments/${commentId}/report`, { reason });
};

export const useReportCommentMutation = () => {
  return useApiMutation((payload: ReportCommentPayload) => reportComment(payload));
};