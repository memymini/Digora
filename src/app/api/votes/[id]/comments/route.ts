import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse, CommentResponse } from "@/lib/types";

export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<CommentResponse[]>>> {
  const { id } = await params;
  try {
    const voteId = parseInt(id, 10);
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

    // The RPC function returns a single JSON value which is the array of comments
    const { data, error } = await (
      await supabase
    ).rpc("get_vote_comments", { p_vote_id: voteId });

    if (error) {
      console.error("Error fetching vote comments:", error);
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

    // The data from this RPC is already the array of comments.
    return NextResponse.json({
      success: true,
      data: data as CommentResponse[],
    });
  } catch (e: unknown) {
    console.error("An unexpected error occurred:", e);
    const errorMessage =
      e instanceof Error ? e.message : "An unknown error occurred.";
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_SERVER_ERROR", message: errorMessage },
      },
      { status: 500 }
    );
  }
}
