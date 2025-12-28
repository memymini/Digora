import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createErrorResponse, createSuccessResponse } from "@/utils/api";
import { voteService } from "@/services/voteService";
import { heroVoteMapper } from "@/utils/mappers";

export const revalidate = 0;

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const data = await voteService.getHeroVote(supabase);

    if (!data) {
      return createSuccessResponse(null);
    }

    const mapped = heroVoteMapper(data);

    return createSuccessResponse(mapped);
  } catch (e: unknown) {
    console.error("An unexpected error occurred:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return createErrorResponse("INTERNAL_SERVER_ERROR", 500, message);
  }
}
