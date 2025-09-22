"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle } from "lucide-react";
import { CommentItem } from "./CommentItem";
import { useState } from "react";
import { CommentResponse } from "@/lib/types";

const mockComments: CommentResponse[] = [
  {
    id: "1",
    content:
      "두 후보 모두 나름의 장점이 있지만, 경제 정책 면에서는 김정치 후보가 더 현실적인 것 같습니다.",
    author: "베리뱃지 사용자",
    badge: "30대 남성 • 회사원",
    likes: 24,
    createdAt: "2시간 전",
    replies: [
      {
        id: "1-1",
        content:
          "동의합니다. 김정치 후보의 공약이 더 구체적이라 신뢰가 가네요.",
        author: "베리뱃지 사용자",
        badge: "30대 여성 • 마케터",
        likes: 8,
        createdAt: "1시간 전",
      },
      {
        id: "1-2",
        content:
          "저는 생각이 좀 다릅니다. 박정책 후보의 복지 정책이 더 중요하다고 생각해요.",
        author: "베리뱃지 사용자",
        badge: "40대 남성 • 교사",
        likes: 12,
        createdAt: "30분 전",
      },
    ],
  },
  {
    id: "2",
    content:
      "박정책 후보의 교육 개혁안이 인상적이네요. 미래 세대를 위한 투자라고 생각합니다.",
    author: "베리뱃지 사용자",
    badge: "40대 여성 • 교사",
    likes: 18,
    createdAt: "4시간 전",
  },
  {
    id: "3",
    content:
      "저는 김정치 후보의 외교 정책이 더 마음에 듭니다. 안정적인 국제 관계가 중요하죠.",
    author: "베리뱃지 사용자",
    badge: "50대 남성 • 자영업",
    likes: 11,
    createdAt: "5시간 전",
    replies: [
      {
        id: "3-1",
        content: "맞아요. 요즘 같은 때일수록 외교가 중요하죠.",
        author: "베리뱃지 사용자",
        badge: "50대 여성 • 주부",
        likes: 5,
        createdAt: "4시간 전",
      },
    ],
  },
  {
    id: "4",
    content:
      "환경 문제에 대한 박정책 후보의 공약이 구체적이어서 신뢰가 갑니다.",
    author: "베리뱃지 사용자",
    badge: "20대 여성 • 대학생",
    likes: 22,
    createdAt: "8시간 전",
  },
  {
    id: "5",
    content:
      "결국 중요한 건 일자리 문제 아닐까요? 두 후보 모두 좀 더 확실한 대책을 보여줬으면 합니다.",
    author: "베리뱃지 사용자",
    badge: "30대 남성 • 개발자",
    likes: 30,
    createdAt: "1일 전",
  },
];
export const CommentSection = ({ isUserVoted }: { isUserVoted: boolean }) => {
  const data = mockComments;
  const [comment, setComment] = useState("");
  const handleCommentSubmit = () => {
    setComment("");
  };
  return (
    <Card className="p-6 card-shadow">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-muted-foreground" />
        <h2 className="heading-2">댓글</h2>
        <span className="caption-text text-muted-foreground">
          ({data.length})
        </span>
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
      <div
        className={`space-y-4 ${
          data.length >= 3
            ? "overflow-y-auto max-h-[22rem] sm:max-h-[30rem] pr-3"
            : ""
        }`}
      >
        {data.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            userVoted={isUserVoted}
          />
        ))}
      </div>
    </Card>
  );
};
