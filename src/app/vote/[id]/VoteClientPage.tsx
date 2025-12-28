"use client";

import BackButton from "@/components/common/BackButton";
import VoteSection from "@/components/vote/VoteSection";
import { CommentSection } from "@/components/vote/CommentSection";

interface VoteClientPageProps {
  voteId: number;
}

export default function VoteClientPage({ voteId }: VoteClientPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <BackButton />
        <VoteSection voteId={voteId} />
        <CommentSection voteId={voteId} />
      </main>
    </div>
  );
}
