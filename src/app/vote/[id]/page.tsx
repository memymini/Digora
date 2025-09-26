import VoteClientPage from "./VoteClientPage";

export default function VotePage({ params }: { params: { id: string } }) {
  const voteId = parseInt(params.id, 10);

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
