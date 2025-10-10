"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { CandidateProfile } from "../common/CandidateProfile";
import { VoteFeedResponse } from "@/lib/types";
import { VoteCountdown } from "../common/VoteCountdown";

export const VoteCard = ({ data }: { data: VoteFeedResponse }) => {
  const router = useRouter();
  const candidateA = data.options[0];
  const candidateB = data.options[1];

  return (
    <Card className="p-6 card-shadow hover:card-shadow-hover hover:scale-[1.02] transition-all duration-300 cursor-pointer group flex flex-col scroll-snap-align-center w-full sm:w-100 flex-shrink-0">
      {/* Title */}
      <div className="mb-4">
        <h3 className="heading-2 mb-2 line-clamp-2 min-h-15">{data.title}</h3>
        <div className="flex items-center justify-between gap-4 caption-text text-muted-foreground">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>{data.totalCount}명 참여 중</span>
          </div>
          <VoteCountdown endsAt={data.endsAt} />
        </div>
      </div>

      {/* Candidates */}
      <div className="w-full">
        <div className="flex items-center justify-center mb-6 w-full gap-2 sm:gap-4">
          <CandidateProfile
            candidate={candidateA}
            isWinner={candidateA.percent > candidateB.percent}
            color="blue"
          />
          <span className="mb-20 text-2xl font-black">VS</span>
          <CandidateProfile
            candidate={candidateB}
            isWinner={candidateB.percent > candidateA.percent}
            color="red"
          />
        </div>
      </div>

      {/* Vote Bar */}
      <div className="relative h-4 bg-muted rounded-full overflow-hidden mb-6">
        <div
          className="absolute left-0 top-0 h-full bg-vote-blue transition-all duration-500"
          style={{ width: `${candidateA.percent}%` }}
        />
        <div
          className="absolute right-0 top-0 h-full bg-vote-red transition-all duration-500"
          style={{ width: `${candidateB.percent}%` }}
        />
      </div>

      {/* Action Button */}
      <Button
        onClick={() => router.push(`/vote/${data.voteId}`)}
        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors label-text"
        variant="vote"
      >
        투표 참여하기
      </Button>
    </Card>
  );
};
