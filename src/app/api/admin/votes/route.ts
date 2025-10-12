import { createErrorResponse, createSuccessResponse } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { adminVoteService } from "@/services/adminVoteService";
import { AdminVotes } from "@/lib/types";

// GET handler
export async function GET() {
  try {
    const data = await adminVoteService.getAllVotes();
    return createSuccessResponse<AdminVotes[]>(data);
  } catch (e: unknown) {
    const error = e as Error;
    return createErrorResponse("DB_ERROR", 500, error.message);
  }
}

// POST handler
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user)
      return createErrorResponse("UNAUTHORIZED", 401, "로그인이 필요합니다.");

    const formData = await req.formData();
    const result = await adminVoteService.createVote(
      supabase,
      user.id,
      formData
    );
    return createSuccessResponse(result);
  } catch (e: unknown) {
    const error = e as Error;
    return createErrorResponse("DB_ERROR", 500, error.message);
  }
}
