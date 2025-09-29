import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse, VoteRequest } from "@/lib/types";

export const revalidate = 0;

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const supabase = await createClient();

    // 1. Get user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "User is not authenticated.",
          },
        },
        { status: 401 }
      );
    }

    // 2. Validate voteId
    const voteId = parseInt(params.id, 10);
    if (isNaN(voteId)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_INPUT",
            message: "Vote ID must be a number.",
          },
        },
        { status: 400 }
      );
    }

    // 3. Validate request body
    const { optionId }: VoteRequest = await request.json();
    if (typeof optionId !== "number") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_INPUT",
            message: "optionId must be a number.",
          },
        },
        { status: 400 }
      );
    }

    // 4. Check vote status and if user has already voted
    const { data: vote, error: voteError } = await supabase
      .from("votes")
      .select("status")
      .eq("id", voteId)
      .single();

    if (voteError) throw voteError;
    if (!vote) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: `Vote with ID ${voteId} not found.`,
          },
        },
        { status: 404 }
      );
    }
    if (vote.status !== "ongoing") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VOTE_NOT_ONGOING",
            message: "This vote is not open for participation.",
          },
        },
        { status: 403 }
      );
    }

    // 5. Insert the ballot
    const { error: ballotError } = await supabase.from("ballots").insert({
      user_id: user.id,
      vote_id: voteId,
      option_id: optionId,
    });

    // Handle potential errors, e.g., user has already voted (violates unique constraint)
    if (ballotError) {
      if (ballotError.code === "23505") {
        // unique_violation
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "ALREADY_VOTED",
              message: "You have already voted in this poll.",
            },
          },
          { status: 409 }
        );
      }
      throw ballotError;
    }

    return NextResponse.json({ success: true, data: null });
  } catch (e: any) {
    console.error("An unexpected error occurred during voting:", e);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_SERVER_ERROR", message: e.message },
      },
      { status: 500 }
    );
  }
}
