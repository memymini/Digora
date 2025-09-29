import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse, VoteResponse, VoteStatus } from "@/lib/types";

export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<VoteResponse>>> {
  try {
    const voteId = parseInt(params.id, 10);
    if (isNaN(voteId)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_INPUT",
            message: "Vote ID must be a number.",
          },
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 2. Fetch the main vote data and its options
    const { data: vote, error: voteError } = await supabase
      .from("votes")
      .select("id, title, details, status, vote_options(*)")
      .eq("id", voteId)
      .single();

    if (voteError) throw voteError;
    if (!vote) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: `Vote with ID ${voteId} not found.`,
          },
        },
        { status: 404 }
      );
    }

    // 3. Fetch ballots and count them by option
    const { data: ballots, error: ballotsError } = await supabase
      .from("ballots")
      .select("option_id")
      .eq("vote_id", voteId);

    if (ballotsError) throw ballotsError;

    const counts: Record<number, number> = {};
    for (const ballot of ballots || []) {
      counts[ballot.option_id] = (counts[ballot.option_id] || 0) + 1;
    }
    const ballotCounts = Object.entries(counts).map(([option_id, count]) => ({
      option_id: Number(option_id),
      count,
    }));

    // 4. Fetch total participant count
    const { count: totalCount, error: totalCountError } = await supabase
      .from("ballots")
      .select("*", { count: "exact", head: true })
      .eq("vote_id", voteId);

    if (totalCountError) throw totalCountError;

    // 5. Check if the current user has voted
    let userVotedOptionId: number | null = null;
    if (user) {
      const { data: userVote, error: userVoteError } = await supabase
        .from("ballots")
        .select("option_id")
        .eq("vote_id", voteId)
        .eq("user_id", user.id)
        .single();
      if (userVoteError && userVoteError.code !== "PGRST116") {
        // Ignore 'PGRST116' (no rows found)
        throw userVoteError;
      }
      if (userVote) {
        userVotedOptionId = userVote.option_id;
      }
    }

    // 6. Combine all data into the final response structure
    const ballotCountMap = new Map(
      ballotCounts?.map((item) => [item.option_id, item.count]) || []
    );

    const responseData: VoteResponse = {
      voteId: vote.id,
      title: vote.title,
      details: vote.details || "",
      totalCount: totalCount || 0,
      status: vote.status as VoteStatus,
      isUserVoted: userVotedOptionId !== null,
      userVotedOptionId: userVotedOptionId,
      options: (vote.vote_options || []).map((opt) => {
        const count = ballotCountMap.get(opt.id) || 0;
        const percent =
          totalCount && totalCount > 0 ? (count / totalCount) * 100 : 0;
        return {
          id: opt.id,
          name: opt.candidate_name,
          imageUrl: opt.image_path || "",
          count: count,
          percent: percent,
        };
      }),
    };

    return NextResponse.json({ success: true, data: responseData });
  } catch (e: any) {
    console.error("An unexpected error occurred:", e);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_SERVER_ERROR", message: e.message },
      },
      { status: 500 }
    );
  }
}
