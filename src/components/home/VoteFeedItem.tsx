"use client";

import { VoteFeed as VoteFeedType } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MiniVoteProgressBar } from "@/components/vote/MiniVoteProgressBar";

interface VoteFeedItemProps {
  vote: VoteFeedType;
}

export const VoteFeedItem = ({ vote }: VoteFeedItemProps) => {
  const optionA = vote.options[0];
  const optionB = vote.options[1];

  // 투표율 계산 (API에서 오지만, 안전을 위해 재계산하거나 API 값 사용)
  const percentA = optionA.percent || 0;
  const percentB = optionB.percent || 0;

  // 우세 판단
  const isTight = Math.abs(percentA - percentB) < 5; // 5% 미만 차이
  const winner =
    percentA > percentB ? optionA : percentB > percentA ? optionB : null;

  return (
    <Link href={`/vote/${vote.voteId}`} prefetch={false}>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex gap-4 battle-card cursor-pointer relative overflow-hidden group">
        <div
          className={`absolute top-0 left-0 w-1 h-full ${
            percentA > percentB ? "bg-vote-blue" : "bg-vote-red"
          }`}
        ></div>

        {/* 이미지 영역 - 우세한 쪽 이미지 보여주기 */}
        <div className="w-20 h-20 md:w-24 md:h-24 flex-none rounded-xl overflow-hidden relative bg-slate-100">
          {winner?.imageUrl ? (
            <Image
              src={winner.imageUrl}
              alt={winner.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-2xl text-slate-400 font-black">
              VS
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-lg leading-tight text-slate-800 line-clamp-2 md:line-clamp-1">
              {vote.title}
            </h3>
            {winner && (
              <Badge
                variant={percentA > percentB ? "vote-blue" : "vote-red"}
                className="hidden sm:inline-flex ml-2 whitespace-nowrap"
              >
                {winner.name} 우세
              </Badge>
            )}
          </div>
          <div className="text-sm text-slate-500 mb-3 flex items-center gap-2">
            <span>누적 {vote.totalCount.toLocaleString()} 클릭</span>
            {isTight && (
              <span className="text-red-500 font-bold">· 박빙 🔥</span>
            )}
          </div>

          {/* 미니 게이지 바 */}
          <MiniVoteProgressBar optionA={optionA} optionB={optionB} />
        </div>

        <div className="hidden md:flex flex-col justify-center pl-4 border-l border-slate-100">
          <Button variant="secondary" size="sm" className="font-bold">
            참여하기
          </Button>
        </div>
      </div>
    </Link>
  );
};
