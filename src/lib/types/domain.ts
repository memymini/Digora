import { AgeRange, CommentStatus, Gender, Role, VoteStatus } from "./enums";

// VoteFeed Response
export interface VoteFeed {
  voteId: number;
  totalCount: number;
  title: string;
  status: string;
  endsAt: string;
  options: Option[];
}

export interface Option {
  id: number;
  name: string;
  imageUrl: string | null;
  count: number;
  percent: number;
}

// HeroVote Response
export interface HeroVote {
  voteId: number;
  title: string;
  details: string;
  status: VoteStatus;
  endsAt: string;
  totalCount: number;
  options: Option[];
}

// Vote Response
export interface VoteDetails {
  voteId: number;
  title: string;
  status: VoteStatus;
  details: string;
  totalCount: number;
  isUserVoted: boolean;
  userVotedOptionId: number | null;
  endsAt: string;
  options: Option[];
}

// Comments Response
export interface Comment {
  id: number;
  content: string;
  author: string;
  badge: string;
  likes: number;
  createdAt: string;
  replies?: Comment[];
}

export interface Comments {
  comments: Comment[];
  totalCount: number;
}

export interface SingleComment {
  id: number;
  body: string;
  createdAt: string;
  parentId: number | null;
  likesCount: number | null;
  profiles: {
    displayName: string | null;
    role: string | null;
  } | null;
}

// =================================
// 표준 API 응답 타입
// =================================
export interface UserPayload {
  userId: string;
  role: string;
  displayName: string;
}

// =================================
// Common 타입
// =================================
// export interface CountPercent {
//   count: number;
//   percent: number;
// }

// export interface Candidate extends CountPercent {
//   name: string;
//   imageUrl?: string;
// }

// export interface Group {
//   key: AgeRange | Gender;
//   totalCount: number;
//   totalPercent: number;
//   results: CountPercent[];
// }

// export interface DailyTrend {
//   time: string;
//   candidateA: number;
//   candidateB: number;
// }

// =================================
// Result 타입
// =================================

export interface Statistics {
  totalCount: number;
  candidates: Option[];
  ageDistribution: AgeDistribution[]; // 연령별 100% 차트, 상세 차트
  genderDistribution: GenderDistribution[]; // 성별 상세 차트
  overallDistribution: OverallDistribution[]; // 연령/성별 100% 차트
  timeline: TimelineDistribution[]; // 날짜별 차트
  summary: Summary;
}

export interface AgeDistribution {
  age: string;
  totalCount: number;
  totalPercent: number;
  results: ChartResult[];
}

export interface GenderDistribution {
  gender: string;
  totalCount: number;
  totalPercent: number;
  results: ChartResult[];
}

export interface OverallDistribution {
  group: string;
  totalCount: number;
  totalPercent: number;
  results: ChartResult[];
}

export interface TimelineDistribution {
  date: string;
  results: ChartResult[];
}

export interface Summary {
  voteDifference: number;
  participationRate: number;
  commentCount: number;
}

export interface ChartResult {
  id: number;
  count: number;
  percent: number;
}
// =================================
// Vote 타입
// =================================

// =================================
// Comment 타입
// =================================
// export interface CommentResponse {
//   id: number;
//   content: string;
//   author: string;
//   badge: string;
//   likes: number;
//   createdAt: string;
//   replies?: CommentResponse[];
// }

// export interface CommentsApiResponse {
//   comments: CommentResponse[];
//   totalCount: number;
// }

// =================================
// Home 타입
// =================================
export interface VoteFeedResponse {
  voteId: number;
  totalCount: number;
  title: string;
  status: string;
  endsAt: string;
  options: Option[];
}

// =================================
// Profile 타입
// =================================
export interface Profile {
  id: string;
  kakao_user_id: string | null;
  display_name: string | null;
  role: Role;
  gender: Gender;
  age_group: AgeRange;
  created_at: string | null;
}

// =================================
// Reported Comment 타입
// =================================
export interface ReportedComment {
  id: number;
  reason: string;
  status: CommentStatus;
  createdAt: string;
  comment: {
    id: number;
    body: string;
    createdAt: string;
  };
  reporter: {
    id: string;
    name: string | null;
  };
}

// =================================
// Vote Option 타입
// =================================
// export interface VoteOption {
//   id: number;
//   vote_id: number;
//   candidate_name: string;
//   party: string | null;
//   image_path: string | null;
//   position: number | null;
// }

// // =================================
// // Vote With Options 타입
// // =================================
// export interface VoteWithOption {
//   id: number;
//   title: string;
//   details: string | null;
//   status: VoteStatus;
//   starts_at: string;
//   ends_at: string;
//   created_by: string | null;
//   vote_options: VoteOption[];
// }
export interface AdminVoteOption {
  id: number;
  name: string;
  party: string | null;
  imageUrl: string | null;
}

export interface AdminVotes {
  id: number;
  title: string;
  details: string | null;
  status: VoteStatus;
  endsAt: string;
  voteOptions: AdminVoteOption[];
}
