import { NextRequest, NextResponse } from "next/server";
import { getVoteStatistics } from "@/services/statisticService";
import { createErrorResponse, createSuccessResponse } from "@/lib/api";

export const revalidate = 0;

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
    const statistics = await getVoteStatistics(voteId);
    return createSuccessResponse(statistics);
  } catch (e: unknown) {
    const error = e as Error;
    // Assuming the service layer throws errors that can be displayed to the user
    // For a production app, you might want to distinguish between expected errors and unexpected ones
    return createErrorResponse("DB_ERROR", 500, error.message);
  }
}
