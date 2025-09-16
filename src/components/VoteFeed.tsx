import { VoteCard } from "./VoteCard";

// Mock data for demonstration
const mockVotes = [
  {
    id: "1",
    title: "부동산 정책, 더 공감 가는 쪽은?",
    candidateA: {
      id: "a1",
      name: "이재명",
      image: "",
      votes: 1543,
    },
    candidateB: {
      id: "b1",
      name: "윤석열",
      image: "",
      votes: 1821,
    },
    totalVotes: 3364,
    topComment:
      "부동산 문제는 단순히 규제만으로는 해결되지 않을 것 같습니다. 근본적인 공급 확대가 필요해요.",
    isActive: true,
  },
  {
    id: "2",
    title: "교육 개혁, 어느 방향이 더 적절한가?",
    candidateA: {
      id: "a2",
      name: "조국",
      image: "",
      votes: 892,
    },
    candidateB: {
      id: "b2",
      name: "유은혜",
      image: "",
      votes: 1205,
    },
    totalVotes: 2097,
    topComment:
      "교육의 공정성과 다양성, 두 마리 토끼를 모두 잡는 정책이 필요하다고 생각합니다.",
    isActive: true,
  },
  {
    id: "3",
    title: "경제 정책의 우선순위는?",
    candidateA: {
      id: "a3",
      name: "홍남기",
      image: "",
      votes: 2156,
    },
    candidateB: {
      id: "b3",
      name: "김상조",
      image: "",
      votes: 1734,
    },
    totalVotes: 3890,
    topComment:
      "장기적 성장과 단기적 안정성의 균형이 가장 중요한 시점인 것 같습니다.",
    isActive: true,
  },
];

export const VoteFeed = () => {
  return (
    <div className="space-y-6">
      {mockVotes.map((vote) => (
        <VoteCard key={vote.id} {...vote} />
      ))}
    </div>
  );
};
