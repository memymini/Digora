"use client";
import { VoteHeader } from "@/components/common/VoteHeader";
import { Card } from "@/components/ui/card";
import { CandidateProfile } from "@/components/common/CandidateProfile";
import { Button } from "../ui/button";
import { useState } from "react";
import { VoteDetails } from "@/types";
import { useVoteMutation } from "@/hooks/mutations/useVoteMutation";
import { useRouter } from "next/navigation";

export default function VoteSection({ data }: { data: VoteDetails }) {
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>();
  const router = useRouter();
  const { mutate, isPending } = useVoteMutation({
    voteId: data.voteId,
  });

  const handleVote = () => {
    if (selectedCandidate && !data.isUserVoted) {
      mutate({ optionId: selectedCandidate });
    }
  };

  const handleSelectCandidate = (optionId: number) => {
    if (!data.isUserVoted) {
      setSelectedCandidate(optionId);
    }
  };
  console.log(data.userVotedOptionId);

  return (
    <Card className="p-8 md:p-12 card-shadow mb-8">
      <VoteHeader
        title={data.title}
        description={data.details}
        totalVotes={data.totalCount}
        isActive={data.status === "ongoing"}
        endsAt={data.endsAt}
      />

      {/* Candidates Section */}
      <div>
        <div className="flex flex-row items-center justify-center gap-2 sm:gap-4 mb-8 relative">
          <CandidateProfile
            candidate={data.options[0]}
            isSelected={selectedCandidate === data.options[0].id}
            isVoted={data.isUserVoted}
            optionId={data.userVotedOptionId}
            onSelect={() => handleSelectCandidate(data.options[0].id)}
            color="blue"
          />
          <span className="mb-20 text-3xl sm:text-4xl md:text-5xl font-black ">
            VS
          </span>
          <CandidateProfile
            candidate={data.options[1]}
            isSelected={selectedCandidate === data.options[1].id}
            isVoted={data.isUserVoted}
            optionId={data.userVotedOptionId}
            onSelect={() => handleSelectCandidate(data.options[1].id)}
            color="red"
          />
        </div>

        {/* Vote Bar */}
        <div className="relative h-6 bg-muted rounded-full overflow-hidden mb-6">
          <div
            className="absolute left-0 top-0 h-full bg-vote-blue transition-all duration-500"
            style={{ width: `${data.options[0].percent}%` }}
          />
          <div
            className="absolute right-0 top-0 h-full bg-vote-red transition-all duration-500"
            style={{ width: `${data.options[1].percent}%` }}
          />
        </div>

        {/* Vote Button */}
        {!data.isUserVoted ? (
          <div className="flex flex-col items-center font-bold">
            <Button
              onClick={handleVote}
              disabled={!selectedCandidate || isPending}
              size="lg"
            >
              {isPending
                ? "투표하는 중..."
                : selectedCandidate
                ? `${
                    selectedCandidate === data.options[0].id
                      ? data.options[0].name
                      : data.options[1].name
                  }에게 투표하기`
                : "후보를 선택해주세요"}
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => router.push(`/result/${data.voteId}`)}
            disabled={isPending}
            variant="secondary"
            size="lg"
          >
            투표 결과 확인하기
          </Button>
        )}
      </div>
    </Card>
  );
}
