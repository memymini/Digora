import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle } from "lucide-react";
import { Comment } from "@/lib/types";
import { CommentItem } from "./CommentItem";

interface CommentSectionProps {
  comments: Comment[];
  userVoted: boolean;
  commentInput: string;
  onCommentChange: (value: string) => void;
  onCommentSubmit: () => void;
}

export const CommentSection = ({
  comments,
  userVoted,
  commentInput,
  onCommentChange,
  onCommentSubmit,
}: CommentSectionProps) => {
  return (
    <Card className="p-6 card-shadow">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-muted-foreground" />
        <h2 className="heading-2">댓글</h2>
        <span className="caption-text text-muted-foreground">
          ({comments.length})
        </span>
      </div>

      {/* Comment Input */}
      {userVoted && (
        <div className="mb-6">
          <Textarea
            placeholder="베리뱃지로 검증된 의견을 남겨보세요..."
            value={commentInput}
            onChange={(e) => onCommentChange(e.target.value)}
            className="mb-3"
          />
          <div className="flex justify-end">
            <Button
              variant="outline"
              disabled={!commentInput.trim()}
              onClick={onCommentSubmit}
              className="label-text"
            >
              댓글 등록
            </Button>
          </div>
        </div>
      )}

      {!userVoted && (
        <div className="mb-6 p-4 bg-muted/50 rounded-lg text-center">
          <p className="body-text text-muted-foreground">
            투표 후 댓글을 작성할 수 있습니다.
          </p>
        </div>
      )}

      {/* Comments List */}
      <div
        className={`space-y-4 ${
          comments.length >= 3
            ? "overflow-y-auto max-h-[22rem] sm:max-h-[30rem] pr-3"
            : ""
        }`}
      >
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} userVoted={userVoted} />
        ))}
      </div>
    </Card>
  );
};
