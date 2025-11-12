import { DailyReportResponse } from "@/types";
import { http } from "@/lib/fetcher";
import { useApiQuery } from "../useApiQuery";
import { ADMIN_QUERY_KEYS } from "./querykeys";

export const getDailyReport = async (): Promise<DailyReportResponse[]> => {
  return http.get<DailyReportResponse[]>("/api/admin/statistics");
};

export const useDailyReportQuery = () => {
  return useApiQuery({
    queryKey: ADMIN_QUERY_KEYS.dailyReport(),
    queryFn: getDailyReport,
  });
};
