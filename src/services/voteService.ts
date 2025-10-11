import {
  StatisticResponse,
  AgeDistribution,
  GenderDistribution,
  OverallDistribution,
  TimelineDistribution,
  Option,
  Summary,
} from "@/lib/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
// interface VoteDetailsRow {
//   total_count: number;
//   options: Option[];
// }

// export async function getVoteDetails(
//   supabase: SupabaseClient,
//   voteId: number,
//   userId?: string
// ) {
//   const [resultsRes, userVoteRes] = await Promise.all([
//     supabase.rpc("get_vote_details", { p_vote_id: voteId }),
//     userId
//       ? supabase
//           .from("ballots")
//           .select("option_id")
//           .eq("vote_id", voteId)
//           .eq("user_id", userId)
//           .single()
//       : Promise.resolve({ data: null, error: null }),
//   ]);

//   const { data: resultsData, error: resultsError } = resultsRes;
//   if (resultsError) throw resultsError;

//   const results: VoteDetailsRow = (Array.isArray(resultsData) && resultsData[0]
//     ? (resultsData[0] as VoteDetailsRow)
//     : undefined) ?? {
//     total_count: 0,
//     options: [],
//   };

//   const { data: userVote, error: userVoteError } = userVoteRes;
//   if (userVoteError && userVoteError.code !== "PGRST116") {
//     // Ignore 'No rows found' error
//     throw userVoteError;
//   }

//   const isUserVoted = !!userVote;
//   const userVotedOptionId = userVote?.option_id || null;

//   return {
//     totalCount: results.total_count || 0,
//     options: results.options || [],
//     isUserVoted,
//     userVotedOptionId,
//   };
// }

export async function getVoteStatistics(
  supabase: SupabaseClient,
  voteId: number
): Promise<StatisticResponse> {
  const ballotsQuery = supabase
    .from("ballots")
    .select(
      `
      created_at,
      option_id,
      profiles ( age_group, gender )
    `
    )
    .eq("vote_id", voteId);

  const optionsQuery = supabase
    .from("vote_options")
    .select("id, candidate_name")
    .eq("vote_id", voteId);

  const commentsQuery = supabase
    .from("comments")
    .select("id", { count: "exact" })
    .eq("vote_id", voteId);

  const [ballotsRes, optionsRes, commentsRes] = await Promise.all([
    ballotsQuery,
    optionsQuery,
    commentsQuery,
  ]);

  if (ballotsRes.error) throw ballotsRes.error;
  if (optionsRes.error) throw optionsRes.error;
  if (commentsRes.error) throw commentsRes.error;

  const ballots = ballotsRes.data || [];
  const options = optionsRes.data || [];
  const commentCount = commentsRes.count ?? 0;

  const totalCount = ballots.length;

  const candidates: Option[] = options.map((opt) => {
    const count = ballots.filter((b) => b.option_id === opt.id).length;
    return {
      id: opt.id,
      name: opt.candidate_name,
      count,
      percent: totalCount > 0 ? (count / totalCount) * 100 : 0,
    } as Option;
  });

  const ageGroups = ["10s", "20s", "30s", "40s", "50s", "60s_plus"];
  const ageDistribution: AgeDistribution[] = ageGroups.map((age) => {
    const ageBallots = ballots.filter((b) => {
      const profile = Array.isArray(b.profiles) ? b.profiles[0] : b.profiles;
      return profile?.age_group === age;
    });
    const total = ageBallots.length;
    return {
      age,
      totalCount: total,
      totalPercent: totalCount > 0 ? (total / totalCount) * 100 : 0,
      results: options.map((opt) => {
        const count = ageBallots.filter((b) => b.option_id === opt.id).length;
        return {
          id: opt.id,
          count,
          percent: total > 0 ? (count / total) * 100 : 0,
        };
      }),
    };
  });

  const genders = ["male", "female"];
  const genderDistribution: GenderDistribution[] = genders.map((gender) => {
    const genderBallots = ballots.filter((b) => {
      const profile = Array.isArray(b.profiles) ? b.profiles[0] : b.profiles;
      return profile?.gender === gender;
    });
    const total = genderBallots.length;
    return {
      gender,
      totalCount: total,
      totalPercent: totalCount > 0 ? (total / totalCount) * 100 : 0,
      results: options.map((opt) => {
        const count = genderBallots.filter(
          (b) => b.option_id === opt.id
        ).length;
        return {
          id: opt.id,
          count,
          percent: total > 0 ? (count / total) * 100 : 0,
        };
      }),
    };
  });

  const overallDistribution: OverallDistribution[] = [];
  const filteredAgeGroups = ageGroups.filter((age) =>
    ["20s", "30s", "40s", "50s"].includes(age)
  );
  filteredAgeGroups.forEach((age) => {
    genders.forEach((gender) => {
      const groupBallots = ballots.filter((b) => {
        const profile = Array.isArray(b.profiles) ? b.profiles[0] : b.profiles;
        return profile?.age_group === age && profile?.gender === gender;
      });
      const total = groupBallots.length;
      overallDistribution.push({
        group: `${age} ${gender}`,
        totalCount: total,
        totalPercent: totalCount > 0 ? (total / totalCount) * 100 : 0,
        results: options.map((opt) => {
          const count = groupBallots.filter(
            (b) => b.option_id === opt.id
          ).length;
          return {
            id: opt.id,
            count,
            percent: total > 0 ? (count / total) * 100 : 0,
          };
        }),
      });
    });
  });

  const timeline: TimelineDistribution[] = [];
  const dates = [
    ...new Set(
      ballots
        .map((b) =>
          b.created_at ? new Date(b.created_at).toLocaleDateString() : null
        )
        .filter(Boolean) as string[]
    ),
  ];
  dates.sort();
  dates.forEach((date) => {
    const dateBallots = ballots.filter(
      (b) =>
        b.created_at && new Date(b.created_at).toLocaleDateString() === date
    );
    timeline.push({
      date,
      results: options.map((opt) => {
        const count = dateBallots.filter((b) => b.option_id === opt.id).length;
        return {
          id: opt.id,
          count,
          percent:
            dateBallots.length > 0 ? (count / dateBallots.length) * 100 : 0,
        };
      }),
    });
  });

  const sortedCandidates = [...candidates].sort((a, b) => b.count - a.count);
  const voteDifference =
    sortedCandidates.length > 1
      ? sortedCandidates[0].count - sortedCandidates[1].count
      : 0;

  const summary: Summary = {
    voteDifference,
    participationRate: 0, // Participation rate calculation requires total eligible voters, which is not available.
    commentCount,
  };

  return {
    totalCount,
    candidates,
    ageDistribution,
    genderDistribution,
    overallDistribution,
    timeline,
    summary,
  };
}

export async function getHeroVote() {
  const supabase = await createClient();

  const { data: vote, error: voteError } = await supabase
    .from("votes")
    .select("id, title, details,status, ends_at")
    .eq("status", "ongoing")
    .order("starts_at", { ascending: false })
    .limit(1)
    .single();

  if (voteError) {
    if (voteError.code === "PGRST116") return null;
    throw new Error(`DB_ERROR: ${voteError.message}`);
  }

  if (!vote) return null;
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "get_vote_details",
    {
      p_vote_id: vote.id,
    }
  );

  if (rpcError) throw new Error(`DB_ERROR: ${rpcError.message}`);
  console.log(rpcData);
  return {
    ...vote,
    total_count: rpcData?.[0]?.total_count ?? 0,
    options: rpcData?.[0]?.options ?? [],
  };
}

export async function getVoteFeed() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_vote_feed");

  if (error) {
    console.error("Supabase RPC error:", error);
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getVoteDetails(voteId: number, userId?: string) {
  const supabase = await createClient();

  const [voteRes, rpcRes, userVoteRes] = await Promise.all([
    supabase
      .from("votes")
      .select("id, title, status, ends_at, details")
      .eq("id", voteId)
      .single(),
    supabase.rpc("get_vote_details", { p_vote_id: voteId }),
    userId
      ? supabase
          .from("ballots")
          .select("option_id")
          .eq("vote_id", voteId)
          .eq("user_id", userId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const { data: vote, error: voteError } = voteRes;
  if (voteError) throw voteError;
  if (!vote) return null;

  const { data: rpcData, error: rpcError } = rpcRes;
  if (rpcError) throw rpcError;

  const { data: userVote, error: userVoteError } = userVoteRes;
  if (userVoteError && userVoteError.code !== "PGRST116") {
    throw userVoteError;
  }
  const userVotedOptionId = userVote?.option_id ?? null;
  const userVoted = Boolean(userVotedOptionId);

  return {
    ...vote,
    total_count: rpcData?.[0]?.total_count ?? 0,
    isUserVoted: userVoted,
    optionId: userVotedOptionId,
    options: rpcData?.[0]?.options ?? [],
  };
}

export async function handleVote(
  userId: string,
  voteId: number,
  optionId: number
) {
  const supabase = await createClient();

  const { data: vote, error: voteError } = await supabase
    .from("votes")
    .select("status")
    .eq("id", voteId)
    .single();

  if (voteError) throw voteError;
  if (!vote) throw new Error("NOT_FOUND");
  if (vote.status !== "ongoing") throw new Error("VOTE_NOT_ONGOING");

  const { error: ballotError } = await supabase.from("ballots").insert({
    user_id: userId,
    vote_id: voteId,
    option_id: optionId,
    created_at: new Date().toISOString(),
  });

  if (ballotError?.code === "23505") throw new Error("ALREADY_VOTED");
  if (ballotError) throw ballotError;

  return { success: true };
}
