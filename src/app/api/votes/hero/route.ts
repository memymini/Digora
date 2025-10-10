import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse, VoteResponse, VoteStatus, Option } from "@/lib/types";
import { createErrorResponse } from "@/lib/api";

export const revalidate = 0;

export async function GET(): Promise<
  NextResponse<ApiResponse<VoteResponse | null>>
> {
  try {
    const supabase = await createClient();

    // Find the latest ongoing vote
    const { data: vote, error: voteError } = await supabase
      .from("votes")
      .select("id, title, details, status, ends_at")
      .eq("status", "ongoing")
      .order("starts_at", { ascending: false })
      .limit(1)
      .single();

    if (voteError) {
      // single() returns an error if no rows are found, we should handle this gracefully
      if (voteError.code === "PGRST116") {
        return NextResponse.json({ success: true, data: null });
      }
      console.error("Error fetching latest vote:", voteError);
      return createErrorResponse("DB_ERROR", 500, voteError.message);
    }

    if (!vote) {
      return NextResponse.json({ success: true, data: null });
    }
    // const {
    //   data: { user },
    // } = await supabase.auth.getUser();

    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "get_vote_details",
      {
        p_vote_id: vote.id,
      }
    );

    if (rpcError) {
      console.error("Error calling get_vote_details RPC:", rpcError);
      return createErrorResponse("DB_ERROR", 500, rpcError.message);
    }

    const rpcResult = rpcData?.[0];
    const totalCount = rpcResult?.v_total_count || 0;
    const optionsData = rpcResult?.v_options || [];

    const mappedOptions: Option[] = optionsData.map(
      (option: {
        id: number;
        name?: string;
        candidate_name?: string;
        imageUrl?: string;
        count: number;
        percent: number;
      }) => ({
        id: option.id,
        name: option.name || option.candidate_name,
        imageUrl: option.imageUrl,
        count: option.count,
        percent: option.percent || 0,
      })
    );
    const responseData: VoteResponse = {
      voteId: vote.id,
      title: vote.title,
      details: vote.details || "",
      totalCount,
      status: vote.status as VoteStatus,
      isUserVoted: false,
      userVotedOptionId: null,
      options: mappedOptions,
      endsAt: vote.ends_at,
    };

    return NextResponse.json({ success: true, data: responseData });
  } catch (e: unknown) {
    console.error("An unexpected error occurred:", e);
    const errorMessage =
      e instanceof Error ? e.message : "An unknown error occurred.";
    return createErrorResponse("INTERNAL_SERVER_ERROR", 500, errorMessage);
  }
}
