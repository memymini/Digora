import { CandidateProfile } from "@/components/common/CandidateProfile";
import { Card } from "@/components/ui/card";
import { VoteHeader } from "../common/VoteHeader";
import { ResultResponse } from "@/lib/types";

// 투표 상세 및 전체 결과 데이터
const mockResultData: ResultResponse = {
  voteId: 1,
  title: "2024년 대선, 누가 더 적합할까요?",
  detail: "투표 설명 글이 여기에...",
  totalCount: 30840,
  duration: 7,
  status: "closed",
  candidates: [
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
      count: 15420,
      percent: 50,
    },
  ],
};

export default function VoteInfo() {
  const data = mockResultData;
  const candidateA = data.candidates[0];
  const candidateB = data.candidates[0];
  return (
    <Card className="p-8 card-shadow mb-8">
      <VoteHeader
        title={data.title}
        description={data.detail}
        totalVotes={data.totalCount}
        isActive={data.status === "ongoing"}
      />

      {/* Final Results Display */}
      <div className="flex flex-row items-center justify-around gap-4 sm:gap-8 mb-8">
        <CandidateProfile
          candidate={candidateA}
          isWinner={candidateA.percent > candidateB.percent}
          isVoted={true}
          color="blue"
        />

        <CandidateProfile
          candidate={candidateB}
          isWinner={candidateB.percent > candidateA.percent}
          isVoted={true}
          color="red"
        />
      </div>
      {/* Final Vote Bar */}
      <div className="relative h-8 bg-muted rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-vote-blue transition-all duration-500"
          style={{ width: `${candidateA.percent}%` }}
        />
        <div
          className="absolute right-0 top-0 h-full bg-vote-red transition-all duration-500"
          style={{ width: `${candidateB.percent}%` }}
        />
      </div>
    </Card>
  );
}
