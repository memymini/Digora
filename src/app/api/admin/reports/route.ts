import { createErrorResponse, createSuccessResponse } from "@/lib/api";
import { adminReportService } from "@/services/adminReportService";
import { reportedCommentsMapper } from "@/lib/mappers";
import { ReportedComment } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const data = await adminReportService.getReports(status);
    const mapped = reportedCommentsMapper(data);
    return createSuccessResponse<ReportedComment[]>(mapped);
  } catch (e: unknown) {
    const error = e as Error;
    return createErrorResponse("DB_ERROR", 500, error.message);
  }
}
