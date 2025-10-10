import { createErrorResponse } from "@/lib/api";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  ApiResponse,
  VoteFeedResponse,
  VoteFeedRpcResponse,
} from "@/lib/types";

export const revalidate = 0;

export async function GET(): Promise<
  NextResponse<ApiResponse<VoteFeedResponse[]>>
> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_vote_feed");

    if (error) {
      console.error("Error fetching vote feed:", error);
      return createErrorResponse("DB_ERROR", 500, error.message);
    }

    // Map snake_case from DB to camelCase for frontend
    const responseData: VoteFeedResponse[] = data.map(
      (item: VoteFeedRpcResponse) => {
        return {
          voteId: item.voteId,
          totalCount: item.totalCount || 0,
          title: item.title,
          candidates: item.candidates || [],
          endsAt: item.ends_at,
        };
      }
    );

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (e: unknown) {
    console.error("An unexpected error occurred:", e);
    const errorMessage =
      e instanceof Error ? e.message : "An unknown error occurred.";
    return createErrorResponse("INTERNAL_SERVER_ERROR", 500, errorMessage);
  }
}
