import { createClient } from "@/lib/supabase/server";
import { commentService } from "@/services/commentService";
import { createErrorResponse, createSuccessResponse } from "@/utils/api";

export async function POST(
  request: Request,
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

    const commentId = parseInt(id, 10);
    if (isNaN(commentId)) {
      return createErrorResponse(
        "BAD_REQUEST",
        400,
        "유효하지 않은 댓글 ID입니다."
      );
    }

    const isLiked = await commentService.toggleLike(
      supabase,
      commentId,
      user.id
    );

    return createSuccessResponse({ isLiked });
  } catch (e: unknown) {
    const errorMessage =
      e instanceof Error ? e.message : "An unknown error occurred.";
    return createErrorResponse("INTERNAL_SERVER_ERROR", 500, errorMessage);
  }
}
