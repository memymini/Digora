"use client";
import { CandidateProfile } from "@/components/common/CandidateProfile";
import { Card } from "@/components/ui/card";
import { VoteHeader } from "../common/VoteHeader";
import { useVoteDetailQuery } from "@/hooks/queries/useVoteDetailQuery";
import { Skeleton } from "@/components/ui/skeleton";

interface VoteInfoProps {
  voteId: number;
}

export default function VoteInfo({ voteId }: VoteInfoProps) {
  const { data, isLoading, error } = useVoteDetailQuery(voteId);

  if (isLoading) {
    return (
      <Card className="p-8 card-shadow mb-8">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-1/2 mb-8" />
        <div className="flex flex-row items-center justify-around gap-4 sm:gap-8 mb-8">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
        <Skeleton className="h-8 w-full rounded-full" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 card-shadow mb-8 text-center text-red-500">
        <p>투표 정보를 불러오는 중 오류가 발생했습니다.</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-8 card-shadow mb-8 text-center text-muted-foreground">
        투표 정보를 찾을 수 없습니다.
      </Card>
    );
  }

  const candidateA = data.options[0];
  const candidateB = data.options[1];

  return (
    <Card className="p-8 card-shadow mb-8">
      <VoteHeader
        title={data.title}
        description={data.details}
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
