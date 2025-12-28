"use client";
import { Card } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { useVoteCommentsQuery } from "@/hooks/queries/useVoteCommentsQuery";
import { CommentSectionSkeleton } from "./CommentSectionSkeleton";
import { CommentInput } from "./CommentInput";
import { CommentList } from "./CommentList";
import { useSession } from "@/app/SessionProvider";
import { handleLoginRedirect } from "@/hooks/useLogin";
import { Button } from "@/components/ui/button";

interface CommentSectionProps {
  voteId: number;
}

export const CommentSection = ({ voteId }: CommentSectionProps) => {
  const { data: commentsData, isLoading, error } = useVoteCommentsQuery(voteId);

  const session = useSession();
  const isLoggedIn = !!session?.profile;

  const comments = commentsData?.comments ?? [];
  const totalCount = commentsData?.totalCount;
  const isUserVoted = !!commentsData?.isUserVoted;

  if (isLoading) {
    return <CommentSectionSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-10">
        <p>댓글을 불러오는 중 오류가 발생했습니다.</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return (
    <Card className="p-6 card-shadow">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-muted-foreground" />
        <h2 className="heading-2">댓글</h2>
        {totalCount !== undefined && (
          <span className="caption-text text-muted-foreground">
            ({totalCount})
          </span>
        )}
      </div>

      {/* Comment Input or Login Prompt */}
      {isLoggedIn ? (
        <CommentInput voteId={voteId} />
      ) : (
        <div className="mb-6 p-4 bg-muted/50 rounded-lg text-center">
          <p className="body-text text-muted-foreground mb-2">
            로그인하고 의견을 남겨보세요.
          </p>
          <Button variant="outline" size="sm" onClick={handleLoginRedirect}>
            로그인하기
          </Button>
        </div>
      )}

      {/* Comments List */}
      <CommentList
        comments={comments}
        isUserVoted={isUserVoted}
        isLoggedIn={isLoggedIn}
        voteId={voteId}
      />
    </Card>
  );
};
