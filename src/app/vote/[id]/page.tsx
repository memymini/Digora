"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, TrendingUp, MessageCircle, Users } from "lucide-react";
import { Header } from "@/components/Header";
import politicianA from "@/assets/images/politician-a.jpg";
import politicianB from "@/assets/images/politician-b.jpg";
import Image from "next/image";

// Mock data - 실제로는 API에서 가져올 데이터
const mockVoteData = {
  id: "1",
  title: "2024년 대선, 누가 더 적합할까요?",
  description:
    "다가오는 대선에서 국가 발전을 위해 더 적합한 후보는 누구라고 생각하시나요? 각 후보의 공약과 비전을 고려해 투표해주세요.",
  candidateA: {
    id: "candidate-a",
    name: "김정치",
    votes: 15420,
    image: politicianA,
  },
  candidateB: {
    id: "candidate-b",
    name: "박정책",
    votes: 12850,
    image: politicianB,
  },
  totalVotes: 28270,
  isActive: true,
  userVoted: null, // null: 미투표, 'candidate-a' | 'candidate-b': 투표 완료
};

const mockComments = [
  {
    id: "1",
    content:
      "두 후보 모두 나름의 장점이 있지만, 경제 정책 면에서는 김정치 후보가 더 현실적인 것 같습니다.",
    author: "베리뱃지 사용자",
    badge: "30대 남성 • 회사원",
    likes: 24,
    createdAt: "2시간 전",
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
  {
    id: "6",
    content:
      "결국 중요한 건 일자리 문제 아닐까요? 두 후보 모두 좀 더 확실한 대책을 보여줬으면 합니다.",
    author: "베리뱃지 사용자",
    badge: "30대 남성 • 개발자",
    likes: 30,
    createdAt: "1일 전",
  },
];

export default function VoteDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null
  );
  const [comment, setComment] = useState("");
  const [userVoted, setUserVoted] = useState<string | null>(
    mockVoteData.userVoted
  );

  const totalCandidateVotes =
    mockVoteData.candidateA.votes + mockVoteData.candidateB.votes;
  const candidateAPercent = Math.round(
    (mockVoteData.candidateA.votes / totalCandidateVotes) * 100
  );
  const candidateBPercent = 100 - candidateAPercent;

  const handleVote = () => {
    if (selectedCandidate && !userVoted) {
      setUserVoted(selectedCandidate);
      // 실제로는 API 호출
      console.log(`투표: ${selectedCandidate}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-6 p-0 h-auto text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="label-text">돌아가기</span>
        </Button>

        {/* Vote Content */}
        <Card className="p-8 card-shadow mb-8">
          {/* Title & Description */}
          <div className="mb-8">
            <h1 className="heading-2 sm:heading-1 mb-4">
              {mockVoteData.title}
            </h1>
            <p className="body-text text-muted-foreground mb-6">
              {mockVoteData.description}
            </p>

            <div className="flex items-center gap-6 caption-text text-muted-foreground">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>{mockVoteData.totalVotes.toLocaleString()}명 참여</span>
              </div>
              {mockVoteData.isActive && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span>진행중</span>
                </div>
              )}
            </div>
          </div>

          {/* Candidates Section */}
          <div className="mb-8">
            <div className="flex flex-row items-center justify-center gap-4 sm:gap-16 mb-8">
              {/* Candidate A */}
              <div
                className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${
                  selectedCandidate === "candidate-a" ? "scale-105" : ""
                } ${userVoted ? "cursor-default" : ""}`}
                onClick={() =>
                  !userVoted && setSelectedCandidate("candidate-a")
                }
              >
                <div
                  className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-4 ring-4 transition-all duration-300 ${
                    selectedCandidate === "candidate-a"
                      ? "ring-vote-blue"
                      : "ring-vote-blue/20"
                  } ${
                    userVoted === "candidate-a" ? "ring-vote-blue ring-4" : ""
                  }`}
                >
                  <Image
                    src={politicianA}
                    alt={mockVoteData.candidateA.name}
                    className="w-full h-full object-cover grayscale"
                  />
                </div>
                <div className="text-center">
                  <p className="text-lg sm:heading-2 text-vote-blue mb-1 sm:mb-2">
                    {mockVoteData.candidateA.name}
                  </p>
                  <p className="text-2xl sm:heading-1 text-vote-blue font-bold">
                    {candidateAPercent}%
                  </p>
                  <p className="caption-text text-muted-foreground mt-1">
                    {mockVoteData.candidateA.votes.toLocaleString()}표
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="text-2xl sm:heading-1 text-muted-foreground font-bold">
                  VS
                </div>
              </div>

              {/* Candidate B */}
              <div
                className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${
                  selectedCandidate === "candidate-b" ? "scale-105" : ""
                } ${userVoted ? "cursor-default" : ""}`}
                onClick={() =>
                  !userVoted && setSelectedCandidate("candidate-b")
                }
              >
                <div
                  className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-4 ring-4 transition-all duration-300 ${
                    selectedCandidate === "candidate-b"
                      ? "ring-vote-red"
                      : "ring-vote-red/20"
                  } ${
                    userVoted === "candidate-b" ? "ring-vote-red ring-4" : ""
                  }`}
                >
                  <Image
                    src={politicianB}
                    alt={mockVoteData.candidateB.name}
                    className="w-full h-full object-cover grayscale"
                  />
                </div>
                <div className="text-center">
                  <p className="text-lg sm:heading-2 text-vote-red mb-1 sm:mb-2">
                    {mockVoteData.candidateB.name}
                  </p>
                  <p className="text-2xl sm:heading-1 text-vote-red font-bold">
                    {candidateBPercent}%
                  </p>
                  <p className="caption-text text-muted-foreground mt-1">
                    {mockVoteData.candidateB.votes.toLocaleString()}표
                  </p>
                </div>
              </div>
            </div>

            {/* Vote Bar */}
            <div className="relative h-6 bg-muted rounded-full overflow-hidden mb-6">
              <div
                className="absolute left-0 top-0 h-full bg-vote-blue transition-all duration-500"
                style={{ width: `${candidateAPercent}%` }}
              />
              <div
                className="absolute right-0 top-0 h-full bg-vote-red transition-all duration-500"
                style={{ width: `${candidateBPercent}%` }}
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
                      selectedCandidate === "candidate-a"
                        ? mockVoteData.candidateA.name
                        : mockVoteData.candidateB.name
                    }에게 투표하기`
                  : "후보를 선택해주세요"}
              </Button>
            ) : (
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="label-text text-primary">
                  투표가 완료되었습니다!
                  {userVoted === "candidate-a"
                    ? mockVoteData.candidateA.name
                    : mockVoteData.candidateB.name}
                  에게 투표하셨습니다.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Comments Section */}
        <Card className="p-6 card-shadow">
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle className="w-5 h-5 text-muted-foreground" />
            <h2 className="heading-2">댓글</h2>
            <span className="caption-text text-muted-foreground">
              ({mockComments.length})
            </span>
          </div>

          {/* Comment Input */}
          {userVoted && (
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
              mockComments.length >= 3
                ? "overflow-y-auto max-h-[22rem] sm:max-h-[30rem] pr-3"
                : ""
            }`}
          >
            {mockComments.map((comment) => (
              <div
                key={comment.id}
                className="border-b border-border pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
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
                <p className="body-text pl-10">{comment.content}</p>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
