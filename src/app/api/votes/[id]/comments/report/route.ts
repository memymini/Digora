import { createErrorResponse, createSuccessResponse } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { reportComment } from "@/services/commentService";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Get user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return createErrorResponse("UNAUTHORIZED", 401, "로그인이 필요합니다.");
    }

    // 2. Get reason from body
    const { commentId, reason } = await req.json();
    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      return createErrorResponse(
        "INVALID_INPUT",
        400,
        "신고 사유를 입력해야 합니다."
      );
    }

    // 3. Report comment via service
    const result = await reportComment(commentId, user.id, reason);

    return createSuccessResponse(result);
  } catch (e: unknown) {
    const error = e as Error;
    return createErrorResponse("DB_ERROR", 500, error.message);
  }
}
