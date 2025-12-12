"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useVoteFeedQuery } from "@/hooks/queries/useVoteFeedQuery";
import { VoteFeedItem } from "./VoteFeedItem";

export const VoteFeed = () => {
  const { data, isLoading } = useVoteFeedQuery();

  if (isLoading) return <VoteFeedSkeleton />;

  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-bold text-slate-800">
          🔥 실시간 관심 집중
        </h2>
        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold animate-pulse">
          LIVE
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {data?.map((vote) => (
          <VoteFeedItem key={vote.voteId} vote={vote} />
        ))}
      </div>
    </div>
  );
};

const VoteFeedSkeleton = () => (
  <div className="lg:col-span-2 space-y-6">
    <div className="flex items-center gap-2 mb-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-5 w-12" />
    </div>

    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex gap-4 battle-card cursor-pointer relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-slate-200"></div>
        <div className="w-20 h-20 md:w-24 md:h-24 flex-none rounded-xl overflow-hidden relative">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="flex-1 flex flex-col justify-center gap-2">
          <div className="space-y-1">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>
    ))}
  </div>
);
