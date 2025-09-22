import { LargeNumberLike } from "crypto";

// 공통 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data?: T;
}

// Enum 타입
export type VoteStatus = "진행 예정" | "진행중" | "투표 종료";
export type AgeRange = "20대" | "30대" | "40대" | "50대" | "60대+";
export type Gender = "여성" | "남성" | "기타";

// Common 타입
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

// Result 타입
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

// Vote 타입

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

// Comment 타입
export interface CommentResponse {
  id: string;
  content: string;
  author: string;
  badge: string;
  likes: number;
  createdAt: string;
  replies?: CommentResponse[];
}
