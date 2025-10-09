// =================================
// 표준 API 응답 타입
// =================================
export interface UserPayload {
  userId: string;
  role: string;
  displayName: string;
}

// 표준 API 성공 응답 타입
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

// 표준 API 에러 응답 타입
export interface ApiErrorResponse {
  success: false;
  status: number;
  error: {
    code: string;
    message: string;
  };
}

// 표준 API 응답 유니온 타입
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// =================================
// Enum 타입
// =================================
export type Role = "admin" | "user";
export type VoteStatus = "scheduled" | "ongoing" | "closed" | "archived";
export type CommentStatus = "pending" | "hidden" | "rejected";
export type AgeRange =
  | "10s"
  | "20s"
  | "30s"
  | "40s"
  | "50s"
  | "60s_plus"
  | "unknown";
export type Gender = "male" | "female" | "other" | "unknown";

// =================================
// Common 타입
// =================================
export interface CountPercent {
  count: number;
  percent: number;
}

export interface Candidate extends CountPercent {
  name: string;
  imageUrl?: string;
}

export interface Option extends Candidate {
  id: number;
}

export interface Group {
  key: AgeRange | Gender;
  totalCount: number;
  totalPercent: number;
  results: CountPercent[];
}

export interface DailyTrend {
  time: string;
  candidateA: number;
  candidateB: number;
}

// =================================
// Result 타입
// =================================
export interface ResultResponse {
  voteId: number;
  title: string;
  detail: string;
  totalCount: number;
  duration: number;
  status: VoteStatus;
  candidates: Option[];
}

export interface StatisticResponse {
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
export interface VoteRequest {
  voteId: number;
  optionId: number;
}

export interface VoteResponse {
  voteId: number;
  title: string;
  details: string;
  totalCount: number;
  status: VoteStatus;
  isUserVoted: boolean;
  userVotedOptionId: number | null;
  options: Option[];
  endsAt: string;
}

// =================================
// Comment 타입
// =================================
export interface CommentResponse {
  id: number;
  content: string;
  author: string;
  badge: string;
  likes: number;
  createdAt: string;
  replies?: CommentResponse[];
}

export interface CommentsApiResponse {
  comments: CommentResponse[];
  totalCount: number;
}

// =================================
// Home 타입
// =================================
export interface VoteFeedResponse {
  voteId: number;
  totalCount: number;
  title: string;
  candidates: Candidate[];
  endsAt: string;
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
  created_at: string;
  comment: {
    id: number;
    body: string;
    created_at: string;
  };
  reporter: {
    id: string;
    display_name: string | null;
  };
}

// =================================
// Vote Option 타입
// =================================
export interface VoteOption {
  id: number;
  vote_id: number;
  candidate_name: string;
  party: string | null;
  image_path: string | null;
  position: number | null;
}

// =================================
// Vote With Options 타입
// =================================
export interface VoteWithOption {
  id: number;
  title: string;
  details: string | null;
  status: VoteStatus;
  starts_at: string;
  ends_at: string;
  created_by: string | null;
  vote_options: VoteOption[];
}
