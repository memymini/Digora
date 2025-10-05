import { createErrorResponse } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ report_id: string }> }
) {
  const { report_id } = await params;
  try {
    const supabase = await createClient();
    const reportId = parseInt(report_id, 10);

    // 1. Check for admin role
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return createErrorResponse("UNAUTHORIZED", 401, "로그인이 필요합니다.");
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      return createErrorResponse("FORBIDDEN", 403, "관리자 권한이 필요합니다.");
    }

    // 2. Get new status from body
    const { status } = await req.json();
    if (!status || !["hidden", "rejected"].includes(status)) {
      return createErrorResponse(
        "INVALID_INPUT",
        400,
        "유효하지 않은 상태 값입니다. 'hidden' 또는 'rejected'만 가능합니다."
      );
    }

    // 3. Call the database function
    const { error } = await supabase.rpc("handle_report", {
      p_report_id: reportId,
      p_new_status: status,
      p_admin_id: user.id,
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: { message: "신고가 처리되었습니다." },
    });
  } catch (e: unknown) {
    const error = e as Error;
    return createErrorResponse("DB_ERROR", 500, error.message);
  }
}
