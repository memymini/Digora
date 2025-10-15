import { CommentStatus, Option, VoteStatus } from "@/types";

export interface VoteFeedResponse {
  vote_id: number;
  total_count: number;
  title: string;
  status: string;
  ends_at: string;
  options: Option[];
}

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
  is_user_voted: boolean;
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

export interface AdminOptionResponse {
  id: number;
  candidate_name: string;
  party: string | null;
  image_path: string | null;
}
export interface AdminVotesResponse {
  id: number;
  title: string;
  details: string | null;
  status: VoteStatus;
  ends_at: string;
  vote_options: AdminOptionResponse[];
}

export interface ReportedCommentResponse {
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
