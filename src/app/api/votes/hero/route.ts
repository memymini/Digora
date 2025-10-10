import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  ApiResponse,
  VoteResponse,
  VoteStatus,
  Option,
  VoteDetailsRpcOption,
} from "@/lib/types";
import { createErrorResponse } from "@/lib/api";
import { getVoteDetails } from "@/services/voteService";

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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const voteDetails = await getVoteDetails(supabase, vote.id, user?.id);

    const mappedOptions: Option[] = (voteDetails.options || []).map(
      (option: VoteDetailsRpcOption) => {
        return {
          ...option,
          name: option.name,
        };
      }
    );
    const responseData: VoteResponse = {
      voteId: vote.id,
      title: vote.title,
      details: vote.details || "",
      totalCount: voteDetails.totalCount,
      status: vote.status as VoteStatus,
      isUserVoted: voteDetails.isUserVoted,
      userVotedOptionId: voteDetails.userVotedOptionId,
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
