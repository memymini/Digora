import { useState } from "react";
import { Comment } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Users, CornerDownRight, ThumbsUp } from "lucide-react"; // ThumbsUp 아이콘 추가

import { useVoteCommentMutation } from "@/hooks/mutations/useVoteCommentMutation";
import { useReportCommentMutation } from "@/hooks/mutations/useReportCommentMutation";
import { useLikeCommentMutation } from "@/hooks/mutations/useLikeCommentMutation"; // '좋아요' 훅 추가

interface CommentItemProps {
  comment: Comment;
  isReply?: boolean;
  userVoted: boolean;
  isLoggedIn: boolean;
  voteId: number;
}

export const CommentItem = ({
  comment,
  isReply = false,
  userVoted,
  isLoggedIn,
  voteId,
}: CommentItemProps) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const { mutate: postReply } = useVoteCommentMutation({ voteId });
  const { mutate: reportComment } = useReportCommentMutation();
  const { mutate: likeComment, isPending: isLiking } = useLikeCommentMutation(); // '좋아요' 훅 사용

  const handleReplySubmit = () => {
    postReply({ content: replyContent, parentId: comment.id });
    setReplyContent("");
    setShowReplyInput(false);
  };

  const handleReport = () => {
    const reason = prompt("신고 사유를 입력해주세요.");
    if (reason && reason.trim()) {
      reportComment(
        { voteId, commentId: comment.id, reason },
        {
          onSuccess: () => {
            alert("신고가 접수되었습니다.");
          },
          onError: (err) => {
            alert(`신고 중 오류가 발생했습니다: ${err.message}`);
          },
        }
      );
    }
  };

  const handleLike = () => {
    likeComment({ commentId: comment.id, voteId });
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
            <p className="label-text text-primary">{comment.author}</p>
            <p className="caption-text text-muted-foreground">
              {comment.createdAt}
            </p>
          </div>
        </div>{" "}
        <Button
          variant="link"
          className="p-0 h-auto text-muted-foreground label-text flex items-center gap-1"
          onClick={handleLike}
          disabled={isLiking}
        >
          <ThumbsUp className="w-4 h-4" />
          {comment.likes > 0 && comment.likes}
        </Button>
      </div>
      <div className={`pl-10 ${isReply ? "pl-4" : ""}`}>
        <p className="body-text mb-2">{comment.content}</p>

        {/* Actions: Replaced userVoted check with isLoggedIn */}
        {isLoggedIn && (
          <div className="flex items-center gap-4">
            {!isReply && (
              <Button
                variant="link"
                className="p-0 h-auto text-muted-foreground label-text"
                onClick={() => setShowReplyInput(!showReplyInput)}
              >
                답글 달기
              </Button>
            )}
            <Button
              variant="link"
              className="p-0 h-auto text-destructive/70 label-text"
              onClick={handleReport}
            >
              신고
            </Button>
          </div>
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
              isLoggedIn={isLoggedIn}
              voteId={voteId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
