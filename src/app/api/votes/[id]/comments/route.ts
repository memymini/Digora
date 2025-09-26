import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse, CommentResponse } from "@/lib/types";

export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<CommentResponse[]>>> {
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
