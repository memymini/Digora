"use client";
import { VoteHeader } from "@/components/common/VoteHeader";
import { Card } from "@/components/ui/card";
import { CandidateProfile } from "@/components/common/CandidateProfile";
import { Button } from "../ui/button";
import { useState } from "react";
import { VoteResponse } from "@/lib/types";
import { useVoteMutation } from "@/hooks/mutations/useVoteMutation";

export default function VoteSection({ data }: { data: VoteResponse }) {
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>();

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

  return (
    <Card className="p-8 md:p-12 card-shadow mb-8">
      <VoteHeader
        title={data.title}
        description={data.details}
        totalVotes={data.totalCount}
        isActive={data.status === "ongoing"}
      />

      {/* Candidates Section */}
      <div className="mb-8">
        <div className="flex flex-row items-center justify-center gap-2 sm:gap-4 mb-8">
          <CandidateProfile
            candidate={data.options[0]}
            isSelected={selectedCandidate === data.options[0].id}
            isVoted={!!data.isUserVoted}
            onSelect={() => handleSelectCandidate(data.options[0].id)}
            color="blue"
          />
          <CandidateProfile
            candidate={data.options[1]}
            isSelected={selectedCandidate === data.options[1].id}
            isVoted={!!data.isUserVoted}
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
          <div className="flex flex-col items-center">
            <Button
              onClick={handleVote}
              disabled={!selectedCandidate || isPending}
              className="w-full h-12 label-text mb-2"
              variant="vote"
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
          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <p className="label-text text-primary">
              투표가 완료되었습니다!
              {data.userVotedOptionId === data.options[0].id
                ? data.options[0].name
                : data.options[1].name}
              에게 투표하셨습니다.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
