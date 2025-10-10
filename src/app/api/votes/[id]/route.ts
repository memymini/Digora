import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse, VoteResponse, VoteStatus, Option } from "@/lib/types";
import { createErrorResponse } from "@/lib/api";

export const revalidate = 0;

interface VoteDetailsRow {
  v_total_count: number;
  v_options: Option[];
}

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
): Promise<NextResponse<ApiResponse<VoteResponse>>> {
  const { id } = await params;

  try {
    const voteId = parseInt(id, 10);
    if (isNaN(voteId)) {
      return createErrorResponse(
        "INVALID_INPUT",
        400,
        "Vote ID must be a number."
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Parallelize fetching vote details, results, and user's vote status
    const [voteRes, resultsRes, userVoteRes] = await Promise.all([
      supabase
        .from("votes")
        .select("id, title, details, status, ends_at")
        .eq("id", voteId)
        .single(),
      supabase.rpc("get_vote_details", { p_vote_id: voteId }),
      user
        ? supabase
            .from("ballots")
            .select("option_id")
            .eq("vote_id", voteId)
            .eq("user_id", user.id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    const { data: vote, error: voteError } = voteRes;
    if (voteError) throw voteError;
    if (!vote) {
      return createErrorResponse(
        "NOT_FOUND",
        404,
        `Vote with ID ${voteId} not found.`
      );
    }

    const { data: resultsData, error: resultsError } = resultsRes;
    if (resultsError) throw resultsError;

    const results: VoteDetailsRow =
      Array.isArray(resultsData) && resultsData[0]
        ? (resultsData[0] as VoteDetailsRow)
        : { v_total_count: 0, v_options: [] };

    const totalCount = results.v_total_count || 0;
    const options = results.v_options || [];
    const safeOptions = options.map((option) => ({
      ...option,
      percent:
        option.percent !== undefined &&
        option.percent !== null &&
        !isNaN(option.percent)
          ? option.percent
          : 0,
    }));

    const { data: userVote, error: userVoteError } = userVoteRes;
    if (userVoteError) {
      throw userVoteError;
    }

    const responseData: VoteResponse = {
      voteId: vote.id,
      title: vote.title,
      details: vote.details || "",
      totalCount,
      status: vote.status as VoteStatus,
      isUserVoted: !!userVote,
      userVotedOptionId: userVote?.option_id || null,
      options: safeOptions,
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
