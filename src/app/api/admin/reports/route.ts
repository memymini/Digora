import { createErrorResponse } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const supabase = await createClient();

    // TODO: Add admin role check from middleware once it's stable

    let query = supabase
      .from("comment_reports")
      .select(
        `
        id,
        reason,
        status,
        created_at,
        comment:comments!inner ( id, body, created_at ),
        reporter:profiles!comment_reports_reporter_id_fkey ( id, display_name )
      `
      );

    if (status === "completed") {
      query = query.in("status", ["hidden", "rejected"]);
    } else {
      query = query.eq("status", "pending");
    }

    const { data, error } = await query.order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (e: unknown) {
    const error = e as Error;
    return createErrorResponse("DB_ERROR", 500, error.message);
  }
}
