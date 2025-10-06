import { createErrorResponse } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";

// GET handler
export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("votes")
      .select("*, vote_options(*)")
      .order("id", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (e: unknown) {
    const error = e as Error;
    return createErrorResponse("DB_ERROR", 500, error.message);
  }
}

// POST handler
const uploadImage = async (supabase: SupabaseClient, file: File) => {
  if (!file || file.size === 0) throw new Error("Image file is required.");
  const fileName = `${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage
    .from("vote-images")
    .upload(fileName, file);
  if (error) throw error;
  const { data: urlData } = supabase.storage
    .from("vote-images")
    .getPublicUrl(data.path);
  return urlData.publicUrl;
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // === START DEBUGGING BLOCK ===
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return createErrorResponse(
        "UNAUTHORIZED",
        401,
        "API Route: User not found."
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return createErrorResponse(
        "NOT_FOUND",
        404,
        `API Route: Profile not found for user ${user.id}.`
      );
    }

    if (profile.role !== "admin") {
      return createErrorResponse(
        "FORBIDDEN",
        403,
        `API Route: User role is '${profile.role}', not 'admin'.`
      );
    }
    // === END DEBUGGING BLOCK ===

    console.log(
      `[ADMIN VOTE CREATE] Auth check passed. User ID: ${user.id}, Profile Role: ${profile.role}`
    );

    const formData = await req.formData();

    const title = formData.get("title") as string;
    const details = formData.get("details") as string;
    const ends_at = formData.get("ends_at") as string;
    const candidateAFile = formData.get("candidateAFile") as File;
    const candidateBFile = formData.get("candidateBFile") as File;
    const candidateAName = formData.get("candidateAName") as string;
    const candidateBName = formData.get("candidateBName") as string;

    const [candidateAUrl, candidateBUrl] = await Promise.all([
      uploadImage(supabase, candidateAFile),
      uploadImage(supabase, candidateBFile),
    ]);

    const { data: voteData, error: voteError } = await supabase
      .from("votes")
      .insert({
        title,
        details,
        starts_at: new Date().toISOString(),
        ends_at,
        status: "ongoing",
      })
      .select()
      .single();

    if (voteError) throw voteError;
    if (!voteData) throw new Error("Failed to create vote.");

    const optionsToInsert = [
      {
        vote_id: voteData.id,
        candidate_name: candidateAName || "후보 1",
        image_path: candidateAUrl,
      },
      {
        vote_id: voteData.id,
        candidate_name: candidateBName || "후보 2",
        image_path: candidateBUrl,
      },
    ];

    const { error: optionsError } = await supabase
      .from("vote_options")
      .insert(optionsToInsert);

    if (optionsError) throw optionsError;

    return NextResponse.json({ success: true, data: voteData });
  } catch (e: unknown) {
    const error = e as Error;
    return createErrorResponse("DB_ERROR", 500, error.message);
  }
}
