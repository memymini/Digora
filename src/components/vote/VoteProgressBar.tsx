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
        <span className="text-3xl md:text-5xl font-black text-brand-main tracking-tighter">
          {option1.percent}%
        </span>
        <span className="text-3xl md:text-5xl font-black text-brand-sub tracking-tighter">
          {option2.percent}%
        </span>
      </div>

      <div className="relative h-4 md:h-6 w-full flex">
        {option1.percent > 0 && (
          <div
            className={`h-full bg-brand-main transition-all duration-500 ease-out ${
              option2.percent === 0 ? "rounded-full" : "rounded-l-full"
            }`}
            style={{ width: `${option1.percent}%` }}
          />
        )}
        {option1.percent > 0 && option2.percent > 0 && (
          <div className="w-1 h-full" />
        )}
        {option2.percent > 0 && (
          <div
            className={`h-full bg-brand-sub transition-all duration-500 ease-out ${
              option1.percent === 0 ? "rounded-full" : "rounded-r-full"
            }`}
            style={{ width: `${option2.percent}%` }}
          />
        )}
      </div>

      <div className="flex justify-between items-start mt-2 px-1 text-xs md:text-sm font-bold text-slate-500">
        <span>{option1.count.toLocaleString()}표</span>
        <span>{option2.count.toLocaleString()}표</span>
      </div>
    </div>
  );
};
