import {
  AdminOptionResponse,
  AdminVotesResponse,
  ReportedCommentResponse,
  VoteDetailsResponse,
  CommentResponse,
  HeroVoteResponse,
  SingleCommentResponse,
  VoteFeedResponse,
} from "@/types/response";
import {
  AgeDistribution,
  GenderDistribution,
  Option,
  VoteFeed,
  HeroVote,
  VoteDetails,
  Comment,
  Comments,
  ReportedComment,
  AdminVoteOption,
  AdminVotes,
} from "@/types/domain";
import { VoteStatus } from "@/types/enums";
export type AgeChartData = {
  age: string;
  [key: `c${number}`]: number;
};

export type GenderChartData = {
  gender: string;
  [key: `c${number}`]: number;
};

export type PieChartData = Option & {
  [key: string]: string | number | undefined;
};

export function mapPieChartData(candidates: Option[]): PieChartData[] {
  return candidates.map(({ descriptions, ...candidate }) => ({
    ...candidate,
  }));
}

export function mapChartData<
  T extends { results: { id: number; count: number }[] },
  U extends Record<string, string | number>
>(
  distribution: T[],
  candidates: Option[],
  labelKey: Exclude<keyof T, "results">,
  labelMapper?: (label: string) => string
): U[] {
  return distribution.map((group) => {
    const rawLabel = group[labelKey] as string;
    const mappedLabel = labelMapper ? labelMapper(rawLabel) : rawLabel;

    const obj: Record<string, string | number> = {
      [labelKey as string]: mappedLabel,
    };

    group.results.forEach((result) => {
      const candidate = candidates.find((c) => c.id === result.id);
      if (candidate) {
        obj[`c${result.id}`] = result.count;
      } else {
        console.warn(
          `⚠️ Candidate with id=${result.id} not found in candidates list`
        );
      }
    });

    return obj as U;
  });
}

export function mapAgeChartData(
  ageDistribution: AgeDistribution[],
  candidates: Option[]
): AgeChartData[] {
  return mapChartData<AgeDistribution, AgeChartData>(
    ageDistribution,
    candidates,
    "age",
    mapAgeGroup
  );
}

export function mapGenderChartData(
  genderDistribution: GenderDistribution[],
  candidates: Option[]
): GenderChartData[] {
  return mapChartData<GenderDistribution, GenderChartData>(
    genderDistribution,
    candidates,
    "gender",
    mapGender
  );
}

// =============================================
// Enum to Display String Mappers
// =============================================

export const GENDER_MAP: Record<string, string> = {
  male: "남성",
  female: "여성",
  other: "기타",
  unknown: "알 수 없음",
};

export const AGE_GROUP_MAP: Record<string, string> = {
  "20s_under": "20미만",
  "20s": "20대",
  "30s": "30대",
  "40s": "40대",
  "50s": "50대",
  "60s_plus": "60대+",
  unknown: "알 수 없음",
};

export const OVERALL_GROUP_MAP: Record<string, string> = {
  "20s male": "20대 남성",
  "20s female": "20대 여성",
  "20s unknown": "20대 기타",
  "30s male": "30대 남성",
  "30s female": "30대 여성",
  "30s unknown": "30대 기타",
  "40s male": "40대 남성",
  "40s female": "40대 여성",
  "40s unknown": "40대 기타",
  "50s male": "50대 남성",
  "50s female": "50대 여성",
  "50s unknown": "50대 기타",
};

export const mapGender = (gender: string): string => {
  return GENDER_MAP[gender] || gender;
};

export const mapAgeGroup = (ageGroup: string): string => {
  return AGE_GROUP_MAP[ageGroup] || ageGroup;
};

export const mapOverallGroup = (group: string): string => {
  return OVERALL_GROUP_MAP[group] || group;
};

export function voteFeedMapper(data: VoteFeedResponse[]): VoteFeed[] {
  return data.map((item) => ({
    voteId: item.vote_id,
    totalCount: item.total_count,
    title: item.title,
    status: item.status,
    endsAt: item.ends_at,
    options: item.options ?? [],
  }));
}

export function heroVoteMapper(data: HeroVoteResponse): HeroVote {
  // 최종 도메인 객체 반환
  return {
    voteId: data.id,
    title: data.title,
    details: data.details,
    status: data.status as VoteStatus,
    endsAt: data.ends_at,
    totalCount: data.total_count,
    options: data.options,
  };
}

// voteMapper: getVoteDetails 서비스 결과를 도메인 타입(Vote)으로 변환
export function voteDetailsMapper(data: VoteDetailsResponse): VoteDetails {
  return {
    voteId: data.id,
    title: data.title,
    status: data.status as VoteStatus,
    details: data.details ?? "",
    endsAt: data.ends_at,
    totalCount: data.total_count,
    isUserVoted: !!data.is_user_voted,
    userVotedOptionId: data.option_id ?? null,
    options: data.options ?? [],
  };
}

export function commentsMapper(commentsData: CommentResponse[]): Comments {
  const totalCount = commentsData.length;

  // 👤 유저별 익명 ID 매핑
  const userToAnonymousIdMap = new Map<string, number>();
  let anonymousCounter = 1;
  commentsData.forEach((comment) => {
    if (comment.user_id && !userToAnonymousIdMap.has(comment.user_id)) {
      userToAnonymousIdMap.set(comment.user_id, anonymousCounter++);
    }
  });

  const commentsMap = new Map<number, Comment>();
  const rootComments: Comment[] = [];

  // 🧩 1차 변환 (DB → Domain)
  commentsData.forEach((comment) => {
    const anonymousId = comment.user_id
      ? userToAnonymousIdMap.get(comment.user_id)
      : 0;
    let author = `익명${anonymousId}`;
    const badge = comment.badge_label || "";

    if (badge) {
      author = `${author} (${badge})`;
    }

    const formatted: Comment = {
      id: comment.id,
      content: comment.body,
      author,
      badge,
      likes: comment.likes_count ?? 0,
      createdAt: new Date(comment.created_at).toLocaleString(),
      replies: [],
    };

    commentsMap.set(comment.id, formatted);
  });

  // 🧩 2차 변환 (트리 구조 구성)
  commentsData.forEach((comment) => {
    const formatted = commentsMap.get(comment.id);
    if (formatted) {
      if (comment.parent_id && commentsMap.has(comment.parent_id)) {
        commentsMap.get(comment.parent_id)!.replies!.push(formatted);
      } else {
        rootComments.push(formatted);
      }
    }
  });

  return { comments: rootComments, totalCount };
}

/**
 * 단일 댓글 Mapper
 */
export function singleCommentMapper(comment: SingleCommentResponse): Comment {
  const profile = Array.isArray(comment.profiles)
    ? comment.profiles[0]
    : comment.profiles;

  return {
    id: comment.id,
    content: comment.body,
    author: profile?.display_name ?? "익명",
    badge: profile?.role ?? "",
    likes: comment.likes_count ?? 0,
    createdAt: new Date(comment.created_at).toLocaleString(),
    replies: [],
  };
}

export function adminVoteOptionMapper(
  option: AdminOptionResponse
): AdminVoteOption {
  return {
    id: option.id,
    name: option.candidate_name,
    party: option.party,
    imageUrl: option.image_path,
    descriptions: option.descriptions,
  };
}

export function adminVotesMapper(votes: AdminVotesResponse[]): AdminVotes[] {
  return votes.map((vote) => ({
    id: vote.id,
    title: vote.title,
    details: vote.details,
    status: vote.status as VoteStatus,
    endsAt: vote.ends_at,
    voteOptions: vote.vote_options.map((option) => ({
      ...adminVoteOptionMapper(option),
    })),
  }));
}

export function reportedCommentMapper(
  response: ReportedCommentResponse
): ReportedComment {
  return {
    id: response.id,
    reason: response.reason,
    status: response.status,
    createdAt: response.created_at,
    comment: {
      id: response.comment.id,
      body: response.comment.body,
      createdAt: response.comment.created_at,
    },
    reporter: {
      id: response.reporter.id,
      name: response.reporter.display_name ?? null,
    },
  };
}

export function reportedCommentsMapper(
  responses: ReportedCommentResponse[]
): ReportedComment[] {
  return responses.map(reportedCommentMapper);
}
