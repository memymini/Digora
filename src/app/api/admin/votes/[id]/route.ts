import { createErrorResponse } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// DELETE /api/admin/votes/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const voteId = parseInt(id, 10);

    const { error } = await supabase
      .from("votes")
      .delete()
      .match({ id: voteId });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data: null });
  } catch (e: unknown) {
    const error = e as Error;
    // RLS errors might not be instanceof Error, handle appropriately
    const message = error.message || "An unexpected error occurred";
    // Consider checking error codes for specific RLS/foreign key violations
    return createErrorResponse("DB_ERROR", 500, message);
  }
}

// PUT /api/admin/votes/[id]
interface OptionPayload {
  id: number;
  candidate_name: string;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const voteId = parseInt(id, 10);
    const body = await req.json();
    const { title, details, ends_at, options } = body;

    const { error: voteUpdateError } = await supabase
      .from("votes")
      .update({ title, details, ends_at })
      .match({ id: voteId });

    if (voteUpdateError) throw voteUpdateError;

    const optionsUpdatePromises = options.map((option: OptionPayload) =>
      supabase
        .from("vote_options")
        .update({ candidate_name: option.candidate_name })
        .match({ id: option.id })
    );

    const results = await Promise.all(optionsUpdatePromises);
    const failedUpdates = results.filter((res) => res.error);
    if (failedUpdates.length > 0) {
      throw new Error(
        `Failed to update options: ${failedUpdates
          .map((f) => f.error?.message)
          .join(", ")}`
      );
    }

    return NextResponse.json({ success: true, data: null });
  } catch (e: unknown) {
    const error = e as Error;
    const message = error.message || "An unexpected error occurred";
    return createErrorResponse("DB_ERROR", 500, message);
  }
}
