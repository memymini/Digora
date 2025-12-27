import { createClient } from "@/lib/supabase/server";
import { createErrorResponse, createSuccessResponse } from "@/utils/api";
import { NextResponse } from "next/server";
import { voteService } from "@/services/voteService";
import { voteFeedMapper } from "@/utils/mappers";

export const revalidate = 0;

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const data = await voteService.getVoteFeed(supabase);

    const mappedData = voteFeedMapper(data);
    return createSuccessResponse(mappedData);
  } catch (e: unknown) {
    console.error("An unexpected error occurred:", e);
    const errorMessage =
      e instanceof Error ? e.message : "An unknown error occurred.";
    return createErrorResponse("INTERNAL_SERVER_ERROR", 500, errorMessage);
  }
}
