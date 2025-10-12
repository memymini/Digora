import { AgeRange, CommentStatus, Gender, Role, VoteStatus } from "./enums";

// 랜딩 페이지 - 투표 목록 타입
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

// 랜딩 페이지 - 메인 투표 타입
export interface HeroVote {
  voteId: number;
  title: string;
  details: string;
  status: VoteStatus;
  endsAt: string;
  totalCount: number;
  options: Option[];
}

// 투표 페이지 - 투표 상세 정보 타입
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

// 투표 페이지 - 댓글 타입
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

// 세션 타입
export interface UserPayload {
  userId: string;
  role: string;
  displayName: string;
}

// 결과 분석 페이지 - 통계 타입
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

// 관리자 페이지 - 신고된 댓글 타입
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

// 관리자 페이지 - 투표 목록 타입
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
