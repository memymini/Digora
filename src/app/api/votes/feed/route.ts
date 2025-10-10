import { createErrorResponse, createSuccessResponse } from "@/lib/api";
import { NextResponse } from "next/server";
import { voteFeedService } from "@/services/voteFeedService";

export const revalidate = 0;

export async function GET(): Promise<NextResponse> {
  try {
    const data = await voteFeedService();
    return createSuccessResponse(data);
  } catch (e: unknown) {
    console.error("An unexpected error occurred:", e);
    const errorMessage =
      e instanceof Error ? e.message : "An unknown error occurred.";
    return createErrorResponse("INTERNAL_SERVER_ERROR", 500, errorMessage);
  }
}
