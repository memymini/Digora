import { createErrorResponse, createSuccessResponse } from "@/lib/api";
import { NextResponse } from "next/server";
import { getVoteFeed } from "@/services/voteService";
import { voteFeedMapper } from "@/lib/mappers";

export const revalidate = 0;

export async function GET(): Promise<NextResponse> {
  try {
    const data = await getVoteFeed();

    const mappedData = voteFeedMapper(data);
    return createSuccessResponse(mappedData);
  } catch (e: unknown) {
    console.error("An unexpected error occurred:", e);
    const errorMessage =
      e instanceof Error ? e.message : "An unknown error occurred.";
    return createErrorResponse("INTERNAL_SERVER_ERROR", 500, errorMessage);
  }
}
