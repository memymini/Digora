import { CommentSection } from "@/components/vote/CommentSection";
import { VoteResponse } from "@/lib/types";
import BackButton from "@/components/common/BackButton";
import VoteSection from "@/components/vote/VoteSection";

// Mock data
const mockVoteData: VoteResponse = {
  voteId: 1,
  title: "2024년 대선, 누가 더 적합할까요?",
  details:
    "다가오는 대선에서 국가 발전을 위해 더 적합한 후보는 누구라고 생각하시나요? 각 후보의 공약과 비전을 고려해 투표해주세요.",
  totalCount: 28270,
  status: "진행중",
  isUserVoted: false,
  userVotedOptionId: null,
  options: [
    {
      id: 1,
      name: "김정치",
      imageUrl: "/images/politician-a.jpg",
      count: 15420,
      percent: 50,
    },
    {
      id: 2,
      name: "박정책",
      imageUrl: "/images/politician-b.jpg",
      count: 12850,
      percent: 50,
    },
  ],
};

export default function VotePage() {
  const voteData = mockVoteData;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Back Button */}
        <BackButton />

        {/* Vote Content */}
        <VoteSection data={voteData} />
        <CommentSection isUserVoted={!!voteData.isUserVoted} />
      </main>
    </div>
  );
}
