import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse, VoteFeedResponse } from "@/lib/types";

export const revalidate = 0;

export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<VoteFeedResponse[]>>> {
  try {
    const supabase = createClient();

    // 'get_vote_feed' RPC 함수를 호출합니다.
    const { data, error } = await (await supabase).rpc("get_vote_feed");

    if (error) {
      console.error("Error fetching vote feed:", error);
      // Supabase 에러 처리
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

    // API 응답 형식에 맞게 데이터를 반환합니다.
    return NextResponse.json({
      success: true,
      data: data as VoteFeedResponse[],
    });
  } catch (e: any) {
    // 기타 서버 에러 처리
    console.error("An unexpected error occurred:", e);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: e.message,
        },
      },
      { status: 500 }
    );
  }
}
