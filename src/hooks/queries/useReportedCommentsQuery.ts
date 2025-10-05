import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/fetcher";
import { ReportedComment } from "@/lib/types";

export const ADMIN_REPORTS_QUERY_KEY = ["admin", "reports"];

const fetchReportedComments = async (): Promise<ReportedComment[]> => {
  return http.get<ReportedComment[]>("/api/admin/reports");
};

export const useReportedCommentsQuery = () => {
  return useQuery<ReportedComment[], Error>({ 
    queryKey: ADMIN_REPORTS_QUERY_KEY,
    queryFn: fetchReportedComments 
  });
};