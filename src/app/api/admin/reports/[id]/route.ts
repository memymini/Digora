import { createErrorResponse, createSuccessResponse } from "@/utils/api";
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { adminReportService } from "@/services/adminReportService";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return createErrorResponse("UNAUTHORIZED", 401, "로그인이 필요합니다.");
    }

    const { status } = await req.json();
    await adminReportService.updateReportStatus(
      supabase,
      user.id,
      parseInt(id, 10),
      status
    );

    return createSuccessResponse();
  } catch (e: unknown) {
    const error = e as Error;
    return createErrorResponse("DB_ERROR", 500, error.message);
  }
}
