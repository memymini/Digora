import { http } from "@/lib/fetcher";
import { ReportedComment } from "@/types";
import { useApiQuery } from "../useApiQuery";

export const getAdminReportsQueryKey = (status: string) => [
  "admin",
  "reports",
  status,
];

const fetchReportedComments = async (
  status: string
): Promise<ReportedComment[]> => {
  const url =
    status === "completed"
      ? "/api/admin/reports?status=completed"
      : "/api/admin/reports";
  return http.get<ReportedComment[]>(url);
};

export const useReportedCommentsQuery = (status: string) => {
  return useApiQuery({
    queryKey: getAdminReportsQueryKey(status),
    queryFn: () => fetchReportedComments(status),
  });
};
