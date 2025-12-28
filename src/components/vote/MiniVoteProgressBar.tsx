import React from "react";
import { Option } from "@/types";

interface MiniVoteProgressBarProps {
  optionA: Option;
  optionB: Option;
}

export const MiniVoteProgressBar = ({
  optionA,
  optionB,
}: MiniVoteProgressBarProps) => {
  const percentA = optionA.percent || 0;
  const percentB = optionB.percent || 0;

  return (
    <>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
        <div
          className="bg-vote-blue h-full transition-all duration-500"
          style={{ width: `${percentA}%` }}
        ></div>
        <div
          className="bg-vote-red h-full transition-all duration-500"
          style={{ width: `${percentB}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs font-bold mt-1.5">
        <span className="text-vote-blue line-clamp-1 max-w-[45%]">
          {optionA.name}
        </span>
        <span className="text-vote-red line-clamp-1 max-w-[45%] text-right">
          {optionB.name}
        </span>
      </div>
    </>
  );
};
