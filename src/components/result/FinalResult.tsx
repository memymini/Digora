import { CandidateProfile } from "@/components/common/CandidateProfile";
import { Card } from "@/components/ui/card";

export default function FinalResult({ data }) {
  const candidateA = data.candidates[0];
  const candidateB = data.candidates[0];
  return (
    <Card className="p-8 card-shadow mb-8">
      <div className="text-center mb-8">
        <h1 className="heading-2 sm:heading-1 mb-4">{data.title}</h1>
        <div className="flex items-center justify-center gap-4 caption-text text-muted-foreground">
          <span>총 {data?.totalCount}명 참여</span>
          <span>•</span>
          <span>{data?.duration} 진행</span>
          <span>•</span>
          <span className="text-red-500 font-semibold">투표 종료</span>
        </div>
      </div>
      {/* Final Results Display */}
      <div className="flex flex-row items-center justify-around gap-4 sm:gap-8 mb-8">
        <CandidateProfile
          candidate={candidateA}
          isWinner={candidateA.percent > candidateB.percent}
          color="blue"
        />

        <CandidateProfile
          candidate={candidateB}
          isWinner={candidateB.percent > candidateA.percent}
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
