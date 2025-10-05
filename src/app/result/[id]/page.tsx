import BackButton from "@/components/common/BackButton";
import Statistics from "@/components/result/Statistics";
import VoteInfo from "@/components/result/VoteInfo";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const voteId = parseInt(id, 10);

  if (isNaN(voteId)) {
    return (
      <main className="container mx-auto px-4 py-6 max-w-4xl text-center">
        <p>잘못된 결과 ID입니다.</p>
      </main>
    );
  }

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
