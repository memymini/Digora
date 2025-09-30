import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse, Candidate, VoteFeedResponse } from "@/lib/types";

export const revalidate = 0;

export async function GET(
): Promise<NextResponse<ApiResponse<VoteFeedResponse[]>>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("votes")
      .select("*, vote_options(*)")
      .order("starts_at", { ascending: false });

    if (error) {
      console.error("Error fetching vote feed:", error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DB_ERROR",
            message: `Database error: ${error.message}`,
          },
        },
        { status: 500 }
      );
    }

    // Efficiently fetch all ballot counts for the retrieved votes
    const voteIds = data.map((vote) => vote.id);
    const { data: ballots, error: ballotsError } = await supabase
      .from("ballots")
      .select("vote_id, option_id")
      .in("vote_id", voteIds);

    if (ballotsError) {
      // Log the error but don't fail the whole request, counts can be 0
      console.error("Error fetching ballot counts:", ballotsError);
    }

    // Process ballots to get total counts and individual option counts
    const voteStats = (ballots || []).reduce((acc, ballot) => {
      if (!acc[ballot.vote_id]) {
        acc[ballot.vote_id] = { total: 0, options: {} };
      }
      acc[ballot.vote_id].total += 1;
      acc[ballot.vote_id].options[ballot.option_id] =
        (acc[ballot.vote_id].options[ballot.option_id] || 0) + 1;
      return acc;
    }, {} as Record<number, { total: number; options: Record<number, number> }>);

    const transformedData: VoteFeedResponse[] = data.map((vote) => {
      const options = vote.vote_options || [];
      const stats = voteStats[vote.id] || { total: 0, options: {} };
      const totalCount = stats.total;

      const candidates: Candidate[] = options.map((opt) => {
        const count = stats.options[opt.id] || 0;
        const percent = totalCount > 0 ? (count / totalCount) * 100 : 0;
        return {
          name: opt.candidate_name || "N/A",
          imageUrl: opt.image_path || "",
          count: count,
          percent: percent,
        };
      });

      return {
        voteId: vote.id,
        title: vote.title,
        totalCount: totalCount,
        candidates: candidates,
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedData,
    });
  } catch (e: unknown) {
    console.error("An unexpected error occurred:", e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: errorMessage,
        },
      },
      { status: 500 }
    );
  }
}
