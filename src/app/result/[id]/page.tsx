import BackButton from "@/components/common/BackButton";
import Statistics from "@/components/result/Statistics";
import VoteInfo from "@/components/result/VoteInfo";

export default function ResultPage({ params }: { params: { id: string } }) {
  const voteId = parseInt(params.id, 10);
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <BackButton />
        {/* Title & Final Results */}
        <VoteInfo voteId={voteId} />
        {/* 통계 결과 분석 */}
        <Statistics voteId={voteId} />
      </main>
    </div>
  );
}
