"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useVoteCommentMutation } from "@/hooks/mutations/useVoteCommentMutation";
import { useState } from "react";

interface CommentInputProps {
  voteId: number;
}

export const CommentInput = ({ voteId }: CommentInputProps) => {
  const [comment, setComment] = useState("");
  const { mutate: postComment } = useVoteCommentMutation({ voteId });

  const handleCommentSubmit = () => {
    postComment({ content: comment });
    setComment("");
  };

  return (
    <div className="mb-6">
      <Textarea
        placeholder="베리뱃지로 검증된 의견을 남겨보세요..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="mb-3"
      />
      <div className="flex justify-end">
        <Button
          variant="outline"
          disabled={!comment.trim()}
          onClick={handleCommentSubmit}
          className="label-text"
        >
          댓글 등록
        </Button>
      </div>
    </div>
  );
};
