import { createErrorResponse } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";

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

// ... (DELETE handler remains the same)

// POST handler for updates (to handle multipart/form-data)
const uploadImage = async (supabase: SupabaseClient, file: File) => {
  if (!file || file.size === 0) return null;
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

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const supabase = await createClient();
    const voteId = parseInt(id, 10);
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const details = formData.get("details") as string;
    const ends_at = formData.get("ends_at") as string;

    // 1. Update vote details
    const { error: voteUpdateError } = await supabase
      .from("votes")
      .update({ title, details, ends_at })
      .eq("id", voteId);

    if (voteUpdateError) throw voteUpdateError;

    // 2. Handle candidate A
    const candidateAId = formData.get("candidateAId") as string;
    const candidateAName = formData.get("candidateAName") as string;
    const candidateAFile = formData.get("candidateAFile") as File | null;

    const candidateAImageUrl = await uploadImage(
      supabase,
      candidateAFile as File
    );
    const candidateAUpdateData: {
      candidate_name: string;
      image_path?: string;
    } = {
      candidate_name: candidateAName,
    };
    if (candidateAImageUrl) {
      candidateAUpdateData.image_path = candidateAImageUrl;
    }
    const { error: candidateAError } = await supabase
      .from("vote_options")
      .update(candidateAUpdateData)
      .eq("id", candidateAId);
    if (candidateAError) throw candidateAError;

    // 3. Handle candidate B
    const candidateBId = formData.get("candidateBId") as string;
    const candidateBName = formData.get("candidateBName") as string;
    const candidateBFile = formData.get("candidateBFile") as File | null;

    const candidateBImageUrl = await uploadImage(
      supabase,
      candidateBFile as File
    );
    const candidateBUpdateData: {
      candidate_name: string;
      image_path?: string;
    } = {
      candidate_name: candidateBName,
    };
    if (candidateBImageUrl) {
      candidateBUpdateData.image_path = candidateBImageUrl;
    }
    const { error: candidateBError } = await supabase
      .from("vote_options")
      .update(candidateBUpdateData)
      .eq("id", candidateBId);
    if (candidateBError) throw candidateBError;

    return NextResponse.json({ success: true, data: null });
  } catch (e: unknown) {
    const error = e as Error;
    const message = error.message || "An unexpected error occurred";
    return createErrorResponse("DB_ERROR", 500, message);
  }
}
