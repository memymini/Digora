import { createClient } from "@/lib/supabase/server";
import { createErrorResponse, createSuccessResponse } from "@/utils/api";
import { DailyReportResponse } from "@/types";
import { adminStatisticService } from "@/services/adminStatisticService";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const data = await adminStatisticService.getDailyStatistics(supabase);
    return createSuccessResponse<DailyReportResponse[]>(data);
  } catch (e: unknown) {
    const error = e as Error;
    return createErrorResponse("DB_ERROR", 500, error.message);
  }
}
