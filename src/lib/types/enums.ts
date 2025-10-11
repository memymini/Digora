export const ROLE = {
  ADMIN: "admin",
  USER: "user",
} as const;
export type Role = "admin" | "user";
export const VOTE_STATUS = {
  SCHEDULED: "scheduled",
  ONGOING: "ongoing",
  CLOSED: "closed",
  ARCHIVED: "archived",
} as const;
export type VoteStatus = (typeof VOTE_STATUS)[keyof typeof VOTE_STATUS];
export const COMMENT_STATUS = {
  PENDING: "pending",
  HIDDEN: "hidden",
  REJECTED: "rejected",
} as const;
export type CommentStatus = "pending" | "hidden" | "rejected";
export const AGE_RANGE = {
  10: "20s_under",
  20: "20s",
  30: "30s",
  40: "40s",
  50: "50s",
  60: "60s_plus",
  UNKNOWN: "unknown",
} as const;
export type AgeRange =
  | "10s"
  | "20s"
  | "30s"
  | "40s"
  | "50s"
  | "60s_plus"
  | "unknown";
export const GENDER = {
  MALE: "male",
  FEMALE: "female",
  UNKNOWN: "unknown",
} as const;
export type Gender = "male" | "female" | "unknown";
