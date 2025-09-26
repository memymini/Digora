"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle } from "lucide-react";
import { CommentItem } from "./CommentItem";
import { useState } from "react";
import { useVoteCommentsQuery } from "@/hooks/queries/useVoteCommentsQuery";
import { Skeleton } from "@/components/ui/skeleton";

const CommentSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-start gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    ))}
  </div>
);

interface CommentSectionProps {
  voteId: number;
  isUserVoted: boolean;
}

export const CommentSection = ({
  voteId,
  isUserVoted,
}: CommentSectionProps) => {
  const { data: commentsData, isLoading, error } = useVoteCommentsQuery(voteId);
  const [comment, setComment] = useState("");

  const handleCommentSubmit = () => {
    // TODO: Implement comment submission logic
    setComment("");
  };

  const renderContent = () => {
    if (isLoading) {
      return <CommentSkeleton />;
    }

    if (error) {
      return (
        <div className="text-center text-red-500 py-10">
          <p>댓글을 불러오는 중 오류가 발생했습니다.</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      );
    }

    if (!commentsData || commentsData.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-10">
          아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
        </div>
      );
    }

    return (
      <div
        className={`space-y-4 ${
          commentsData.length >= 3
            ? "overflow-y-auto max-h-[22rem] sm:max-h-[30rem] pr-3"
            : ""
        }`}
      >
        {commentsData.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            userVoted={isUserVoted}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="p-6 card-shadow">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-muted-foreground" />
        <h2 className="heading-2">댓글</h2>
        {!isLoading && !error && commentsData && (
          <span className="caption-text text-muted-foreground">
            ({commentsData.length})
          </span>
        )}
      </div>

      {/* Comment Input */}
      {isUserVoted && (
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
      )}

      {!isUserVoted && (
        <div className="mb-6 p-4 bg-muted/50 rounded-lg text-center">
          <p className="body-text text-muted-foreground">
            투표 후 댓글을 작성할 수 있습니다.
          </p>
        </div>
      )}

      {/* Comments List */}
      {renderContent()}
    </Card>
  );
};
