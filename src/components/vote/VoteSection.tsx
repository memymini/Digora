"use client";

import { useVoteDetailQuery } from "@/hooks/queries/useVoteDetailQuery";
import { useVoteMutation } from "@/hooks/mutations/useVoteMutation";
import { VoteOptionCard } from "./VoteOptionCard";
import { VoteProgressBar } from "./VoteProgressBar";
import { VoteSectionSkeleton } from "./VoteSectionSkeleton";

export default function VoteSection({ voteId }: { voteId: number }) {
  const { data, isLoading, error } = useVoteDetailQuery(voteId);
  const { mutate } = useVoteMutation({
    voteId: voteId,
  });

  if (isLoading) return <VoteSectionSkeleton />;
  if (error)
    return (
      <div className="text-center text-red-500 py-10">
        투표 정보를 불러오는데 실패했습니다.
      </div>
    );
  if (!data)
    return (
      <div className="text-center py-10">투표 정보를 찾을 수 없습니다.</div>
    );

  const handleVote = (optionId: number) => {
    mutate({ optionId });
  };

  const totalVotes = data.totalCount;
  const isEnded = new Date(data.endsAt) < new Date();

  return (
    <section className="mb-12 w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8 px-2">
        <h1 className="text-2xl md:text-4xl font-black text-slate-800 mb-2">
          {data.title}
        </h1>
        <p className="text-slate-500 text-sm md:text-base">{data.details}</p>
        <div className="mt-2 text-slate-400 text-xs font-medium">
          누적 {totalVotes.toLocaleString()}클릭
          {isEnded && <span className="ml-2 text-red-500">종료된 투표</span>}
        </div>
      </div>

      {/* Option Cards */}
      <div
        className={`grid ${
          data.options.length === 2
            ? "grid-cols-2"
            : "grid-cols-1 md:grid-cols-2"
        } gap-3 md:gap-6 relative mb-8`}
      >
        {/* VS Badge - Only show for 2 options */}
        {data.options.length === 2 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="bg-white rounded-full w-10 h-10 md:w-16 md:h-16 flex items-center justify-center font-black text-sm md:text-2xl shadow-xl border-2 md:border-4 border-slate-50 text-slate-800 italic">
              VS
            </div>
          </div>
        )}

        {data.options.map((option, index) => (
          <VoteOptionCard
            key={option.id}
            option={option}
            themeColor={index === 0 ? "vote-blue" : "vote-red"}
            onVote={handleVote}
            disabled={isEnded}
          />
        ))}
      </div>

      {data.options.length === 2 && (
        <VoteProgressBar option1={data.options[0]} option2={data.options[1]} />
      )}
    </section>
  );
}
