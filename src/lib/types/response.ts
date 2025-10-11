import { Option, VoteStatus } from "@/lib/types";

// VoteFeed Dto
export interface VoteFeedRpcResponse {
  vote_id: number;
  total_count: number;
  title: string;
  status: string;
  ends_at: string;
  options: Option[];
}

//
export interface VoteDetailsRpcResponse {
  total_count: number;
  options: Option[];
}

export interface HeroVoteResponse {
  id: number;
  title: string;
  details: string;
  status: VoteStatus;
  ends_at: string;
  total_count: number;
  options: Option[];
}

export interface VoteDetailsResponse {
  id: number;
  title: string;
  details: string;
  status: VoteStatus;
  ends_at: string;
  total_count: number;
  options: Option[];
  isUserVoted: boolean;
  option_id?: number | null;
}

export interface CommentResponse {
  id: number;
  body: string;
  created_at: string;
  parent_id: number | null;
  likes_count: number | null;
  user_id: string | null;
  badge_label: string | null;
  profiles: { role: string | null }[];
}

export interface SingleCommentResponse {
  id: number;
  body: string;
  created_at: string;
  parent_id: number | null;
  likes_count: number | null;
  profiles: { role: string | null; display_name: string | null }[];
}
