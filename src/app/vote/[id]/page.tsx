import VoteClientPage from "./VoteClientPage";

export default async function VotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const voteId = parseInt(id, 10);

  // Basic validation in the server component
  if (isNaN(voteId)) {
    // Or render a dedicated not found page
    return (
      <main className="container mx-auto px-4 py-6 max-w-4xl text-center">
        <p>잘못된 투표 ID입니다.</p>
      </main>
    );
  }

  return <VoteClientPage voteId={voteId} />;
}
