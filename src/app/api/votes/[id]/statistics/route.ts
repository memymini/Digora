import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse, StatisticResponse } from "@/lib/types";
import { getVoteStatistics } from "@/services/voteService";
import { createErrorResponse } from "@/lib/api";

export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<StatisticResponse>>> {
  const { id } = await params;
  try {
    const voteId = parseInt(id, 10);
    if (isNaN(voteId)) {
      return createErrorResponse("INVALID_INPUT", 400, "Invalid vote ID");
    }

    const supabase = await createClient();
    const statistics = await getVoteStatistics(supabase, voteId);

    return NextResponse.json({ success: true, data: statistics });
  } catch (e: unknown) {
    const error = e as Error;
    // Assuming the service layer throws errors that can be displayed to the user
    // For a production app, you might want to distinguish between expected errors and unexpected ones
    return createErrorResponse("DB_ERROR", 500, error.message);
  }
}
