"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CandidateProfile } from "@/components/common/CandidateProfile";
import { VoteHeader } from "@/components/common/VoteHeader";
import { CommentSection } from "@/components/vote/CommentSection";
import { VoteResponse, CommentResponse } from "@/lib/types";

// Mock data - 실제로는 API에서 가져올 데이터
const mockVoteData: VoteResponse = {
  voteId: 1,
  title: "2024년 대선, 누가 더 적합할까요?",
  details:
    "다가오는 대선에서 국가 발전을 위해 더 적합한 후보는 누구라고 생각하시나요? 각 후보의 공약과 비전을 고려해 투표해주세요.",
  totalCount: 28270,
  status: "진행중",
  isUserVoted: false,
  userVotedOptionId: null,
  options: [
    {
      id: 1,
      name: "김정치",
      imageUrl: "/images/politician-a.jpg",
      count: 15420,
      percent: 50,
    },
    {
      id: 2,
      name: "박정책",
      imageUrl: "/images/politician-b.jpg",
      count: 12850,
      percent: 50,
    },
  ],
};

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

export default function VotePage() {
  const { id } = useParams();
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>();
  const [comment, setComment] = useState("");
  const [userVoted, setUserVoted] = useState<number | null>(
    mockVoteData.userVotedOptionId
  );

  const handleVote = () => {
    if (selectedCandidate && !userVoted) {
      setUserVoted(selectedCandidate);
      // 실제로는 API 호출
      console.log(`투표: ${selectedCandidate}`);
    }
  };

  const handleCommentSubmit = () => {
    console.log("Submitting comment:", comment);
    // 실제로는 API 호출
    setComment("");
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 p-0 h-auto text-muted-foreground hover:text-foreground"
        >
          <Link href="/" className="flex items-center">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="label-text">돌아가기</span>
          </Link>
        </Button>

        {/* Vote Content */}
        <Card className="p-8 md:p-12 card-shadow mb-8">
          <VoteHeader
            title={mockVoteData.title}
            description={mockVoteData.details}
            totalVotes={mockVoteData.totalCount}
            isActive={mockVoteData.status === "진행중"}
          />

          {/* Candidates Section */}
          <div className="mb-8">
            <div className="flex flex-row items-center justify-center gap-2 sm:gap-4 mb-8">
              <CandidateProfile
                candidate={mockVoteData.options[0]}
                percentage={mockVoteData.options[0].percent}
                isSelected={selectedCandidate === mockVoteData.options[0].id}
                isVoted={!!userVoted}
                onSelect={() =>
                  !userVoted && setSelectedCandidate(mockVoteData.options[0].id)
                }
                color="blue"
              />
              <CandidateProfile
                candidate={mockVoteData.options[1]}
                percentage={mockVoteData.options[1].percent}
                isSelected={selectedCandidate === mockVoteData.options[1].id}
                isVoted={!!userVoted}
                onSelect={() =>
                  !userVoted && setSelectedCandidate(mockVoteData.options[1].id)
                }
                color="red"
              />
            </div>

            {/* Vote Bar */}
            <div className="relative h-6 bg-muted rounded-full overflow-hidden mb-6">
              <div
                className="absolute left-0 top-0 h-full bg-vote-blue transition-all duration-500"
                style={{ width: `${mockVoteData.options[0].percent}%` }}
              />
              <div
                className="absolute right-0 top-0 h-full bg-vote-red transition-all duration-500"
                style={{ width: `${mockVoteData.options[1].percent}%` }}
              />
            </div>

            {/* Vote Button */}
            {!userVoted ? (
              <Button
                onClick={handleVote}
                disabled={!selectedCandidate}
                className="w-full h-12 label-text"
                variant="vote"
              >
                {selectedCandidate
                  ? `${
                      selectedCandidate === mockVoteData.options[0].id
                        ? mockVoteData.options[0].name
                        : mockVoteData.options[1].name
                    }에게 투표하기`
                  : "후보를 선택해주세요"}
              </Button>
            ) : (
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="label-text text-primary">
                  투표가 완료되었습니다!
                  {userVoted === mockVoteData.options[0].id
                    ? mockVoteData.options[0].name
                    : mockVoteData.options[1].name}
                  에게 투표하셨습니다.
                </p>
              </div>
            )}
          </div>
        </Card>

        <CommentSection
          comments={mockComments}
          userVoted={!!userVoted}
          commentInput={comment}
          onCommentChange={setComment}
          onCommentSubmit={handleCommentSubmit}
        />
      </main>
    </div>
  );
}
