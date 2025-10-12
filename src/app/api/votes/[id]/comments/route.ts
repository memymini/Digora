import { createErrorResponse, createSuccessResponse } from "@/lib/api";
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
    const data = await commentService.getComments(voteId);
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
    const newComment = await commentService.createComment(
      voteId,
      content,
      parentId
    );
    return createSuccessResponse(newComment);
  } catch (e) {
    const error = e as Error;
    return createErrorResponse("DB_ERROR", 500, error.message);
  }
}
