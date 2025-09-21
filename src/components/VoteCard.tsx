"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import politicianA from "@/assets/images/politician-a.jpg";
import politicianB from "@/assets/images/politician-b.jpg";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Candidate {
  id: string;
  name: string;
  image: string;
  votes: number;
}

interface VoteCardProps {
  id: string;
  title: string;
  candidateA: Candidate;
  candidateB: Candidate;
  totalVotes: number;
  topComment?: string;
  isActive: boolean;
}

export const VoteCard = ({
  id,
  title,
  candidateA,
  candidateB,
  totalVotes,
  topComment,
  isActive,
}: VoteCardProps) => {
  const router = useRouter();
  const totalCandidateVotes = candidateA.votes + candidateB.votes;
  const candidateAPercent =
    totalCandidateVotes > 0
      ? Math.round((candidateA.votes / totalCandidateVotes) * 100)
      : 50;
  const candidateBPercent = 100 - candidateAPercent;

  return (
    <Card className="p-6 card-shadow hover:card-shadow-hover transition-all duration-300 cursor-pointer group flex flex-col">
      {/* Title */}
      <div className="mb-4">
        <h3 className="heading-2 mb-2 line-clamp-2 min-h-15">{title}</h3>
        <div className="flex items-center gap-4 caption-text text-muted-foreground">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>{totalVotes.toLocaleString()}명 참여 중</span>
          </div>
          {isActive && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span>진행중</span>
            </div>
          )}
        </div>
      </div>

      {/* Candidates */}
      <div className="mb-6">
        <div className="flex items-center justify-center mb-6">
          {/* Candidate A */}
          <div className="flex flex-col items-center max-w-[200px]">
            <div className="w-36 h-48 overflow-hidden mb-3 inset-ring-2 inset-ring-vote-blue/20">
              <Image
                src={politicianA}
                alt={candidateA.name}
                className="w-full h-full object-cover grayscale"
              />
            </div>
            <div className="text-center">
              <p className="label-text text-vote-blue">{candidateA.name}</p>
              <p className="heading-2 text-vote-blue font-bold">
                {candidateAPercent}%
              </p>
            </div>
          </div>
          {/* Candidate B */}
          <div className="flex flex-col items-center max-w-[200px]">
            <div className="w-36 h-48 overflow-hidden mb-3 inset-ring-2 inset-ring-vote-red/20">
              <Image
                src={politicianB}
                alt={candidateB.name}
                className="w-full h-full object-cover grayscale"
              />
            </div>
            <div className="text-center">
              <p className="label-text text-vote-red">{candidateB.name}</p>
              <p className="heading-2 text-vote-red font-bold">
                {candidateBPercent}%
              </p>
            </div>
          </div>
        </div>

        {/* Vote Bar */}
        <div className="relative h-4 bg-muted rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-vote-blue transition-all duration-500"
            style={{ width: `${candidateAPercent}%` }}
          />
          <div
            className="absolute right-0 top-0 h-full bg-vote-red transition-all duration-500"
            style={{ width: `${candidateBPercent}%` }}
          />
        </div>
        {/* 
        <div className="flex justify-between mt-2 caption-text text-muted-foreground">
          <span>{candidateA.votes.toLocaleString()}표</span>
          <span>{candidateB.votes.toLocaleString()}표</span>
        </div> */}
      </div>

      {/* Action Button */}
      <Button
        onClick={() => router.push(`/vote/${id}`)}
        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors label-text"
        variant="vote"
      >
        투표 참여하기
      </Button>
    </Card>
  );
};
