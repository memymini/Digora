import { useApiMutation } from "../useApiMutation";
import { http } from "@/lib/fetcher";
import { useQueryClient } from "@tanstack/react-query";
import { ADMIN_REPORTS_QUERY_KEY } from "../queries/useReportedCommentsQuery";

interface HandleReportPayload {
  reportId: number;
  status: "hidden" | "rejected";
}

const handleReport = async ({ reportId, status }: HandleReportPayload) => {
  return http.put<null>(`/api/admin/reports/${reportId}`, { status });
};

export const useHandleReportMutation = () => {
  const queryClient = useQueryClient();

  return useApiMutation((payload: HandleReportPayload) => handleReport(payload), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_REPORTS_QUERY_KEY });
    },
  });
};