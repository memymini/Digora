import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse, VoteResponse } from "@/lib/types";

export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<VoteResponse>>> {
  try {
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

    const supabase = createClient();

    const { data, error } = await (await supabase)
      .rpc("get_vote_details", { p_vote_id: voteId })
      .single(); // .single() ensures we get one row or null, and throws an error if multiple rows are returned.

    if (error) {
      console.error("Error fetching vote details:", error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DB_ERROR",
            message: `Database error: ${error.message}`,
          },
        },
        { status: 500 }
      );
    }

    if (!data) {
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

    return NextResponse.json({ success: true, data: data as VoteResponse });
  } catch (e: any) {
    console.error("An unexpected error occurred:", e);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_SERVER_ERROR", message: e.message },
      },
      { status: 500 }
    );
  }
}
