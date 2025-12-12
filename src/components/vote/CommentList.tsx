"use client";

import { CommentItem } from "./CommentItem";
import { Comment } from "@/types";

interface CommentListProps {
  comments: Comment[];
  isUserVoted: boolean;
  isLoggedIn: boolean;
  voteId: number;
}

export const CommentList = ({
  comments,
  isUserVoted,
  isLoggedIn,
  voteId,
}: CommentListProps) => {
  if (!comments || comments.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10">
        아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
      </div>
    );
  }

  return (
    <div
      className={`space-y-4 ${
        comments.length >= 3
          ? "overflow-y-auto max-h-[22rem] sm:max-h-[30rem] pr-3"
          : ""
      }`}
    >
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          userVoted={isUserVoted}
          isLoggedIn={isLoggedIn}
          voteId={voteId}
        />
      ))}
    </div>
  );
};
