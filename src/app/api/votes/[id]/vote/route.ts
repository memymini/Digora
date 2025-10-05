import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse, VoteRequest } from "@/lib/types";
import { createErrorResponse } from "@/lib/api";

export const revalidate = 0;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<null>>> {
  const { id } = await params;
  try {
    const supabase = await createClient();

    // 1. Get user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return createErrorResponse("UNAUTHORIZED", 401, "권한이 없습니다.");
    }

    // 2. Validate voteId
    const voteId = parseInt(id, 10);

    if (isNaN(voteId)) {
      return createErrorResponse(
        "INVALID_INPUT",
        400,
        "Vote ID must be a number."
      );
    }

    // 3. Validate request body
    const { optionId }: VoteRequest = await req.json();

    if (typeof optionId !== "number") {
      return createErrorResponse(
        "INVALID_INPUT",
        400,
        "optionId must be a number."
      );
    }
    // 4. Check vote status
    const { data: vote, error: voteError } = await supabase
      .from("votes")
      .select("status")
      .eq("id", voteId)
      .single();

    if (voteError) throw voteError;

    if (!vote) {
      return createErrorResponse(
        "NOT_FOUND",
        404,
        `Vote with ID ${voteId} not found.`
      );
    }
    if (vote.status !== "ongoing") {
      return createErrorResponse(
        "VOTE_NOT_ONGOING",
        403,
        "This vote is not open for participation."
      );
    }

    // 5. Insert the ballot
    const { error: ballotError } = await supabase.from("ballots").insert({
      user_id: user.id,
      vote_id: voteId,
      option_id: optionId,
    });

    if (ballotError) {
      if (ballotError.code === "23505") {
        // unique_violation
        return createErrorResponse(
          "ALREADY_VOTED",
          409,
          "You have already voted in this poll."
        );
      }
      throw ballotError;
    }

    return NextResponse.json({ success: true, data: null });
  } catch (e: unknown) {
    const message =
      e instanceof Error
        ? e.message
        : `Caught a non-error object: ${JSON.stringify(e)}`;
    return createErrorResponse("INTERNAL_SERVER_ERROR", 500, message);
  }
}
