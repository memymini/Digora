"use client";

import { useVoteDetailQuery } from "@/hooks/queries/useVoteDetailQuery";
import BackButton from "@/components/common/BackButton";
import VoteSection from "@/components/vote/VoteSection";
import { CommentSection } from "@/components/vote/CommentSection";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

const VotePageSkeleton = () => (
  <div className="container mx-auto px-4 py-6 max-w-4xl space-y-8">
    <Card className="p-8 card-shadow mb-8 w-full">
      <Skeleton className="h-10 w-2/3 mb-4" />
      <Skeleton className="h-6 w-1/2 mb-8" />
      <div className="flex flex-row items-center justify-around gap-8 mb-8 w-full">
        <div className="flex flex-col items-center gap-6 w-full">
          <Skeleton className="h-auto w-full aspect-[3/4] " />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="flex flex-col items-center gap-6 w-full">
          <Skeleton className="h-auto w-full aspect-[3/4] " />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
      <Skeleton className="h-6 w-full rounded-full mb-8" />
      <Skeleton className="h-12 w-full rounded-lg" />
    </Card>
    <Skeleton className="h-96 w-full rounded-lg" />
  </div>
);

interface VoteClientPageProps {
  voteId: number;
}

export default function VoteClientPage({ voteId }: VoteClientPageProps) {
  const { data: voteData, isLoading, error } = useVoteDetailQuery(voteId);

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <VotePageSkeleton />
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-6 max-w-4xl text-center text-red-500">
        <p>데이터를 불러오는 중 오류가 발생했습니다.</p>
        <p className="text-sm">{error.message}</p>
      </main>
    );
  }

  if (!voteData) {
    return (
      <main className="container mx-auto px-4 py-6 max-w-4xl text-center">
        <p>투표 정보를 찾을 수 없습니다.</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <BackButton />
        <VoteSection data={voteData} />
        <CommentSection voteId={voteId} isUserVoted={!!voteData.isUserVoted} />
      </main>
    </div>
  );
}
