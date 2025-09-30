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

// =================================
// Profile 타입
// =================================
export interface Profile {
  id: string;
  kakao_user_id: string | null;
  display_name: string | null;
  role: 'user' | 'admin';
  gender: 'male' | 'female' | 'other' | 'unknown';
  age_group: '10s' | '20s' | '30s' | '40s' | '50s' | '60s_plus' | 'unknown';
  created_at: string | null;
}

// =================================
// Reported Comment 타입
// =================================
export interface ReportedComment {
  id: number;
  comment_id: number;
  reporter_id: string;
  reason: string;
  status: 'pending' | 'hidden' | 'rejected';
  handled_by: string | null;
  handled_at: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
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
