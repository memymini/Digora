import { createErrorResponse, createSuccessResponse } from "@/utils/api";
import { DailyReportResponse } from "@/types";
import { adminStatisticService } from "@/services/adminStatisticService";

export async function GET(request: Request) {
  try {
    const data = await adminStatisticService.getDailyStatistics();
    return createSuccessResponse<DailyReportResponse[]>(data);
  } catch (e: unknown) {
    const error = e as Error;
    return createErrorResponse("DB_ERROR", 500, error.message);
  }
}
