import { NextResponse, NextRequest } from "next/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/api";
import { getVoteDetails, handleVote } from "@/services/voteService";
import { createClient } from "@/lib/supabase/server";
import { voteDetailsMapper } from "@/lib/mappers";
import { VoteRequest } from "@/lib/types";

export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  const voteId = parseInt(id, 10);

  if (isNaN(voteId)) {
    return createErrorResponse(
      "INVALID_INPUT",
      400,
      "Vote ID must be a number."
    );
  }

  try {
    // ✅ Supabase 세션에서 현재 로그인 유저 정보 가져오기
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // ✅ userId를 서비스로 전달
    const data = await getVoteDetails(voteId, user?.id);
    if (!data) {
      return createErrorResponse(
        "NOT_FOUND",
        404,
        `Vote with ID ${voteId} not found.`
      );
    }
    const mapped = voteDetailsMapper(data);
    return createSuccessResponse(mapped);
  } catch (e: unknown) {
    console.error("[API /votes/[id]] Error:", e);
    const message =
      e instanceof Error ? e.message : "An unknown error occurred.";
    return createErrorResponse("INTERNAL_SERVER_ERROR", 500, message);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return createErrorResponse("UNAUTHORIZED", 401, "권한이 없습니다.");
    }

    const voteId = parseInt(id, 10);
    if (isNaN(voteId)) {
      return createErrorResponse(
        "INVALID_INPUT",
        400,
        "Vote ID must be a number."
      );
    }

    const { optionId }: VoteRequest = await req.json();
    if (typeof optionId !== "number") {
      return createErrorResponse(
        "INVALID_INPUT",
        400,
        "optionId must be a number."
      );
    }

    const data = await handleVote(user.id, voteId, optionId);
    return createSuccessResponse(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : JSON.stringify(e);

    switch (message) {
      case "NOT_FOUND":
        return createErrorResponse("NOT_FOUND", 404, "Vote not found");
      case "VOTE_NOT_ONGOING":
        return createErrorResponse(
          "VOTE_NOT_ONGOING",
          403,
          "Vote is not ongoing"
        );
      case "ALREADY_VOTED":
        return createErrorResponse("ALREADY_VOTED", 409, "Already voted");
      default:
        return createErrorResponse("INTERNAL_SERVER_ERROR", 500, message);
    }
  }
}
