import { createErrorResponse, createSuccessResponse } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { adminVoteService } from "@/services/adminVoteService";

// DELETE /api/admin/votes/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    await adminVoteService.deleteVote(supabase, id);
    return createSuccessResponse();
  } catch (e: unknown) {
    const error = e as Error;
    const message = error.message || "An unexpected error occurred";
    return createErrorResponse("DB_ERROR", 500, message);
  }
}

// POST /api/admin/votes/[id]
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const formData = await req.formData();
    await adminVoteService.updateVote(supabase, id, formData);
    return createSuccessResponse();
  } catch (e: unknown) {
    const error = e as Error;
    const message = error.message || "An unexpected error occurred";
    return createErrorResponse("DB_ERROR", 500, message);
  }
}
