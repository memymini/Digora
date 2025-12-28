"use client";

import { Option } from "@/types";

interface VoteProgressBarProps {
  option1: Option;
  option2: Option;
}

export const VoteProgressBar = ({ option1, option2 }: VoteProgressBarProps) => {
  return (
    <div className="mb-12">
      <div className="flex justify-between items-end mb-3 px-1">
        <span className="text-3xl md:text-5xl font-black text-vote-blue tracking-tighter">
          {option1.percent ?? 0}%
        </span>
        <span className="text-3xl md:text-5xl font-black text-vote-red tracking-tighter">
          {option2.percent ?? 0}%
        </span>
      </div>

      <div className="relative h-4 md:h-6 w-full flex bg-slate-100 rounded-full overflow-hidden">
        {option1.count === 0 && option2.count === 0 ? (
          <div className="w-full h-full bg-slate-200 rounded-full" />
        ) : (
          <>
            <div
              className={`h-full bg-vote-blue transition-all duration-500 ease-out ${
                option2.percent === 0 ? "rounded-full" : "rounded-l-full"
              }`}
              style={{ width: `${option1.percent}%` }}
            />
            {option1.percent > 0 && option2.percent > 0 && (
              <div className="w-1 h-full bg-white" />
            )}
            <div
              className={`h-full bg-vote-red transition-all duration-500 ease-out ${
                option1.percent === 0 ? "rounded-full" : "rounded-r-full"
              }`}
              style={{ width: `${option2.percent}%` }}
            />
          </>
        )}
      </div>

      <div className="flex justify-between items-start mt-2 px-1 text-xs md:text-sm font-bold text-slate-500">
        <span>{option1.count.toLocaleString()}표</span>
        <span>{option2.count.toLocaleString()}표</span>
      </div>
    </div>
  );
};
