// VoteFeed Dto
export interface VoteFeedDto {
  vote_id: number;
  total_count: number;
  title: string;
  status: string;
  ends_at: string;
  options: VoteOptionDto[];
}

export interface VoteOptionDto {
  id: number;
  name: string;
  imageUrl: string | null;
  count: number;
  percent: number;
}
