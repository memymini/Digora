"use client";

import { useVoteDetailQuery } from "@/hooks/queries/useVoteDetailQuery";
import BackButton from "@/components/common/BackButton";
import VoteSection from "@/components/vote/VoteSection";
import { CommentSection } from "@/components/vote/CommentSection";
import { Skeleton } from "@/components/ui/skeleton";

const VotePageSkeleton = () => (
  <div className="container mx-auto px-4 py-6 max-w-4xl space-y-8">
    <Skeleton className="h-8 w-24" />
    <div className="space-y-4">
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-2/3" />
    </div>
    <div className="flex gap-4">
      <Skeleton className="h-64 w-1/2 rounded-lg" />
      <Skeleton className="h-64 w-1/2 rounded-lg" />
    </div>
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
