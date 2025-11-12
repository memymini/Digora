export const VOTE_QUERY_KEYS = {
  all: ["votes"] as const,
  feed: () => [...VOTE_QUERY_KEYS.all, "feed"] as const,
  detail: (voteId: number) =>
    [...VOTE_QUERY_KEYS.all, "detail", voteId] as const,
  comments: (voteId: number) =>
    [...VOTE_QUERY_KEYS.all, "comments", voteId] as const,
  statistics: (voteId: number) =>
    [...VOTE_QUERY_KEYS.all, "statistics", voteId] as const,
  hero: () => [...VOTE_QUERY_KEYS.all, "hero"] as const,
};

export const ADMIN_QUERY_KEYS = {
  all: ["admin"] as const,
  statistics: () => [...ADMIN_QUERY_KEYS.all, "statistics"] as const,
  dailyReport: () => [...ADMIN_QUERY_KEYS.all, "statistics", "daily"] as const,
};
