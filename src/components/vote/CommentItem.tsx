"use client";
import { useState } from "react";
import { CommentResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Users, CornerDownRight } from "lucide-react";

interface CommentItemProps {
  comment: CommentResponse;
  isReply?: boolean;
  userVoted: boolean;
}

export const CommentItem = ({
  comment,
  isReply = false,
  userVoted,
}: CommentItemProps) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const handleReplySubmit = () => {
    console.log(`Replying to comment ${comment.id}:`, replyContent);
    // 실제로는 API 호출로 답글을 등록합니다.
    setReplyContent("");
    setShowReplyInput(false);
  };

  return (
    <div
      className={`w-full ${
        isReply ? "pt-4 pl-8" : "border-b border-border pb-4 last:border-b-0"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {isReply && (
            <CornerDownRight className="w-4 h-4 text-muted-foreground" />
          )}
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="label-text text-primary">{comment.badge}</p>
            <p className="caption-text text-muted-foreground">
              {comment.createdAt}
            </p>
          </div>
        </div>
        <span className="caption-text text-muted-foreground">
          👍 {comment.likes}
        </span>
      </div>
      <div className={`pl-10 ${isReply ? "pl-4" : ""}`}>
        <p className="body-text mb-2">{comment.content}</p>
        {userVoted && !isReply && (
          <Button
            variant="link"
            className="p-0 h-auto text-muted-foreground label-text"
            onClick={() => setShowReplyInput(!showReplyInput)}
          >
            답글 달기
          </Button>
        )}
        {showReplyInput && (
          <div className="mt-4">
            <Textarea
              placeholder="답글을 입력하세요..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="mb-2"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyInput(false)}
              >
                취소
              </Button>
              <Button
                size="sm"
                disabled={!replyContent.trim()}
                onClick={handleReplySubmit}
              >
                등록
              </Button>
            </div>
          </div>
        )}
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              isReply={true}
              userVoted={userVoted}
            />
          ))}
        </div>
      )}
    </div>
  );
};
