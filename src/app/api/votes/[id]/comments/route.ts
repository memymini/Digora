import { createClient } from "@/lib/supabase/server";
import { createErrorResponse, createSuccessResponse } from "@/utils/api";
import { NextRequest, NextResponse } from "next/server";
import { commentService } from "@/services/commentService";

export const revalidate = 0;

// GET /api/votes/[id]/comments - 댓글 목록 조회
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  try {
    const voteId = parseInt(id, 10);
    if (isNaN(voteId)) {
      return createErrorResponse("INVALID_INPUT", 400, "Invalid vote ID");
    }
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    const data = await commentService.getComments(supabase, voteId, userId);
    return createSuccessResponse(data);
  } catch (e) {
    const error = e as Error;
    return createErrorResponse("DB_ERROR", 500, error.message);
  }
}

// POST /api/votes/[id]/comments - 댓글 생성
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  try {
    const voteId = parseInt(id, 10);
    if (isNaN(voteId)) {
      return createErrorResponse("INVALID_INPUT", 400, "Invalid vote ID");
    }
    const { content, parentId } = await req.json();
    if (!content) {
      return createErrorResponse("INVALID_INPUT", 400, "댓글 내용이 없습니다.");
    }
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return createErrorResponse("UNAUTHORIZED", 401, "로그인이 필요합니다.");
    }

    const newComment = await commentService.createComment(
      supabase,
      voteId,
      user.id,
      content,
      parentId
    );
    return createSuccessResponse(newComment);
  } catch (e) {
    const error = e as Error;
    return createErrorResponse("DB_ERROR", 500, error.message);
  }
}
