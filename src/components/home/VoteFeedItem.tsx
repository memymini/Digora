"use client";

import { VoteFeed as VoteFeedType } from "@/types";
import Image from "next/image";
import Link from "next/link";

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
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex gap-4 battle-card cursor-pointer relative overflow-hidden group hover:border-brand-main/50 transition-colors">
        <div
          className={`absolute top-0 left-0 w-1 h-full ${
            percentA > percentB ? "bg-brand-main" : "bg-brand-sub"
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
            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-2xl">
              VS
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-lg leading-tight text-slate-800 line-clamp-2 md:line-clamp-1 group-hover:text-brand-main transition-colors">
              {vote.title}
            </h3>
            {winner && (
              <span
                className={`hidden sm:inline-block text-xs font-bold px-2 py-1 rounded whitespace-nowrap ml-2 ${
                  percentA > percentB
                    ? "text-brand-main bg-indigo-50"
                    : "text-brand-sub bg-rose-50"
                }`}
              >
                {winner.name} 우세
              </span>
            )}
          </div>
          <div className="text-sm text-slate-500 mb-3 flex items-center gap-2">
            <span>누적 {vote.totalCount.toLocaleString()} 클릭</span>
            {isTight && (
              <span className="text-red-500 font-bold">· 박빙 🔥</span>
            )}
          </div>

          {/* 미니 게이지 바 */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className="bg-brand-main h-full transition-all duration-500"
              style={{ width: `${percentA}%` }}
            ></div>
            <div
              className="bg-brand-sub h-full transition-all duration-500"
              style={{ width: `${percentB}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs font-bold mt-1.5">
            <span className="text-brand-main line-clamp-1 max-w-[45%]">
              {optionA.name}
            </span>
            <span className="text-brand-sub line-clamp-1 max-w-[45%] text-right">
              {optionB.name}
            </span>
          </div>
        </div>

        <div className="hidden md:flex flex-col justify-center pl-4 border-l border-slate-100">
          <button className="text-sm font-bold text-slate-700 bg-slate-50 px-4 py-2 rounded-lg transition-colors">
            참여하기
          </button>
        </div>
      </div>
    </Link>
  );
};
