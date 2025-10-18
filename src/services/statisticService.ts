import {
  AgeDistribution,
  GenderDistribution,
  OverallDistribution,
  TimelineDistribution,
  Option,
  Summary,
} from "@/types";

import { createClient } from "@/lib/supabase/server";

export async function getVoteStatistics(voteId: number) {
  const supabase = await createClient();
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
      percent:
        totalCount > 0
          ? parseFloat(((count / totalCount) * 100).toFixed(1))
          : 0,
    } as Option;
  });

  const ageGroups = ["20s_under", "20s", "30s", "40s", "50s", "60s_plus"];
  const ageDistribution: AgeDistribution[] = ageGroups.map((age) => {
    const ageBallots = ballots.filter((b) => {
      const profile = Array.isArray(b.profiles) ? b.profiles[0] : b.profiles;
      return profile?.age_group === age;
    });
    const total = ageBallots.length;
    return {
      age,
      totalCount: total,
      totalPercent:
        totalCount > 0
          ? parseFloat(((total / totalCount) * 100).toFixed(1))
          : 0,
      results: options.map((opt) => {
        const count = ageBallots.filter((b) => b.option_id === opt.id).length;
        return {
          id: opt.id,
          count,
          percent:
            total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0,
        };
      }),
    };
  });
  const genders = ["male", "female", "unknown"];
  const genderDistribution: GenderDistribution[] = genders.map((gender) => {
    const genderBallots = ballots.filter((b) => {
      const profile = Array.isArray(b.profiles) ? b.profiles[0] : b.profiles;
      return profile?.gender === gender;
    });
    const total = genderBallots.length;
    return {
      gender,
      totalCount: total,
      totalPercent:
        totalCount > 0
          ? parseFloat(((total / totalCount) * 100).toFixed(1))
          : 0,
      results: options.map((opt) => {
        const count = genderBallots.filter(
          (b) => b.option_id === opt.id
        ).length;
        return {
          id: opt.id,
          count,
          percent:
            total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0,
        };
      }),
    };
  });

  const overallDistribution: OverallDistribution[] = [];
  const filteredAgeGroups = ageGroups.filter((age) =>
    ["20s", "30s", "40s", "50s"].includes(age)
  );
  filteredAgeGroups.forEach((age) => {
    genders
      .filter((gender) => gender !== "unknown")
      .forEach((gender) => {
        const groupBallots = ballots.filter((b) => {
          const profile = Array.isArray(b.profiles)
            ? b.profiles[0]
            : b.profiles;
          return profile?.age_group === age && profile?.gender === gender;
        });
        const total = groupBallots.length;
        overallDistribution.push({
          group: `${age} ${gender}`,
          totalCount: total,
          totalPercent:
            totalCount > 0
              ? Number(((total / totalCount) * 100).toFixed(1))
              : 0,
          results: options.map((opt) => {
            const count = groupBallots.filter(
              (b) => b.option_id === opt.id
            ).length;
            return {
              id: opt.id,
              count,
              percent:
                total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0,
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
  dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
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
            dateBallots.length > 0
              ? parseFloat(((count / dateBallots.length) * 100).toFixed(1))
              : 0,
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
