export interface UserPayload {
  userId: string;
  role: string;
  displayName: string;
}

// =================================
// 표준 API 응답 타입
// =================================

// 표준 API 에러 객체 타입
export interface ApiError {
  code: string; // 예: 'INTERNAL_SERVER_ERROR', 'INVALID_INPUT'
  message: string;
}

// 표준 API 성공 응답 타입
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

// 표준 API 에러 응답 타입
export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}

// 표준 API 응답 유니온 타입
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// =================================
// Enum 타입
// =================================
export type VoteStatus = "scheduled" | "ongoing" | "closed" | "archived";
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
  imageUrl: string;
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
  totalCount: number;
  duration: number;
  status: VoteStatus;
  candidates: Candidate[];
}

export interface StatisticResponse {
  ageGroups: Group[];
  genderGroups: Group[];
  dailyTrend: DailyTrend[];
}

// =================================
// Vote 타입
// =================================
export interface VoteRequest {
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

// =================================
// Home 타입
// =================================
export interface VoteFeedResponse {
  voteId: number;
  totalCount: number;
  title: string;
  candidates: Candidate[];
}
