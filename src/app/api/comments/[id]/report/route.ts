import { createErrorResponse } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const commentId = parseInt(id, 10);

    // 1. Get user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return createErrorResponse("UNAUTHORIZED", 401, "로그인이 필요합니다.");
    }

    // 2. Get reason from body
    const { reason } = await req.json();
    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      return createErrorResponse(
        "INVALID_INPUT",
        400,
        "신고 사유를 입력해야 합니다."
      );
    }

    // 3. Insert into comment_reports table
    const { error } = await supabase.from("comment_reports").insert({
      comment_id: commentId,
      reporter_id: user.id,
      reason: reason,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    if (error) {
      // Handle potential db errors, e.g., comment_id not found
      if (error.code === "23503") {
        // foreign_key_violation
        return createErrorResponse(
          "NOT_FOUND",
          404,
          "존재하지 않는 댓글입니다."
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: { message: "신고가 접수되었습니다." },
    });
  } catch (e: unknown) {
    const error = e as Error;
    return createErrorResponse("DB_ERROR", 500, error.message);
  }
}
