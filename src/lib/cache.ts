// --- 데이터 타입(구조) 정의 ---

// '투표'가 어떤 정보를 가질지 정의합니다.
export interface Poll {
  id: number;
  title: string;
  optionA: {
    name: string;
    imageUrl: string;
  };
  optionB: {
    name:string;
    imageUrl: string;
  };
}

// '댓글'이 어떤 정보를 가질지 정의합니다.
export interface Comment {
  id: number;
  pollId: number;
  userId: string; // 임시 사용자 ID
  content: string;
  badgeText?: string;
}

// '투표 기록'이 어떤 정보를 가질지 정의합니다.
export interface Vote {
  userId: string;
  pollId: number;
  option: 'A' | 'B';
}


// --- 인메모리 데이터 저장소 ---

// polls: 앱에서 사용할 투표 목록 (초기 데이터 포함)
const polls: Poll[] = [
  {
    id: 1,
    title: '윤석열 대 이재명',
    optionA: { name: '윤석열', imageUrl: '/images/politician-a.jpg' },
    optionB: { name: '이재명', imageUrl: '/images/politician-b.jpg' },
  },
  {
    id: 2,
    title: '이재명 대 조국',
    optionA: { name: '이재명', imageUrl: '/images/politician-b.jpg' },
    optionB: { name: '조국', imageUrl: '/images/politician-c.jpg' },
  },
  {
    id: 3,
    title: '조국 대 한동훈',
    optionA: { name: '조국', imageUrl: '/images/politician-c.jpg' },
    optionB: { name: '한동훈', imageUrl: '/images/politician-d.jpg' },
  },
];

// comments: 사용자가 작성할 댓글 목록 (초기에는 비어있음)
const comments: Comment[] = [];

// votes: 사용자의 투표 기록 (초기에는 비어있음)
const votes: Vote[] = [];


// --- 데이터 조작을 위한 함수들 ---

// 모든 투표 목록을 반환하는 함수
export const getPolls = () => {
  return polls;
};

// ID로 특정 투표를 찾아 반환하는 함수
export const getPollById = (id: number) => {
  return polls.find((p) => p.id === id);
};

// 특정 투표에 달린 댓글 목록을 반환하는 함수
export const getCommentsByPollId = (pollId: number) => {
  return comments.filter((c) => c.pollId === pollId);
};

// 새로운 댓글을 추가하는 함수
export const addComment = (commentData: Omit<Comment, 'id'>) => {
  const newComment = { ...commentData, id: Date.now() };
  comments.push(newComment);
  return newComment;
};

// 새로운 투표를 기록하는 함수
export const addVote = (voteData: Vote) => {
  // 이미 투표했는지 확인 (나중에 구현)
  votes.push(voteData);
  return voteData;
}