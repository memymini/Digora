"use client";

import { HeroVote } from "@/types";
import { CandidateProfile } from "../common/CandidateProfile";
import Link from "next/link";

interface HeroVoteProps {
  data: HeroVote;
}

export const HeroVoteSection = ({ data }: HeroVoteProps) => {
  const candidateA = data.options[0];
  const candidateB = data.options[1];

  if (!candidateA || !candidateB) {
    return <div>후보자 정보를 불러올 수 없습니다.</div>;
  }

  return (
    <section className="flex flex-col items-center justify-start w-full gap-4 md:gap-6 text-center h-auto">
      <h1 className="mb-2 text-2xl sm:text-2xl font-extrabold leading-tight text-center md:text-4xl animate-fade-in-up">
        {data.title}
      </h1>
      <p className="max-w-2xl mx-auto body-text text-muted-foreground md:body-text-1 animate-fade-in-up animation-delay-200 mb-8">
        {data.details}
      </p>

      <div className="w-full max-w-250 animate-fade-in-up animation-delay-400">
        <div className="w-full">
          <div className="flex items-center justify-center mb-6 w-full gap-4 sm:gap-8 md:gap-12">
            <Link href={`/vote/${data.voteId}`} className="w-full h-full">
              <CandidateProfile
                candidate={candidateA}
                isWinner={candidateA.percent > candidateB.percent}
                color="blue"
                variant="hero"
              />
            </Link>
            <span className="mb-20 text-2xl sm:text-3xl font-black">VS</span>
            <Link href={`/vote/${data.voteId}`} className="w-full h-full">
              <CandidateProfile
                candidate={candidateB}
                isWinner={candidateB.percent > candidateA.percent}
                color="red"
                variant="hero"
              />
            </Link>
          </div>
        </div>

        {/* Vote Bar */}
        <div className="relative h-4 md:h-6 bg-muted rounded-full overflow-hidden mb-6">
          <div
            className="absolute left-0 top-0 h-full bg-vote-blue transition-all duration-500"
            style={{ width: `${candidateA.percent}%` }}
          />
          <div
            className="absolute right-0 top-0 h-full bg-vote-red transition-all duration-500"
            style={{ width: `${candidateB.percent}%` }}
          />
        </div>
      </div>
    </section>
  );
};
