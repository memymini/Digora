"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";
import { Option } from "@/types";

type ClickEffect = {
  id: number;
  x: number;
  y: number;
  text: string;
};

interface VoteOptionCardProps {
  option: Option;
  themeColor: "vote-blue" | "vote-red";
  onVote: (optionId: number) => void;
}

const THEME_STYLES = {
  "vote-blue": {
    border: "hover:border-vote-blue/30",
    text: "text-vote-blue",
    bg: "bg-indigo-50",
    buttonHover: "hover:bg-vote-blue",
    shadowHover: "hover:shadow-indigo-500/25",
    circleBorder: "border-indigo-100/50",
    circleBg: "bg-indigo-50/50",
    placeholderBg: "bg-indigo-100/50",
  },
  "vote-red": {
    border: "hover:border-vote-red/30",
    text: "text-vote-red",
    bg: "bg-rose-50",
    buttonHover: "hover:bg-vote-red",
    shadowHover: "hover:shadow-rose-500/25",
    circleBorder: "border-rose-100/50",
    circleBg: "bg-rose-50/50",
    placeholderBg: "bg-rose-100/50",
  },
};

export const VoteOptionCard = ({
  option,
  themeColor,
  onVote,
}: VoteOptionCardProps) => {
  const [clickEffects, setClickEffects] = useState<ClickEffect[]>([]);
  const styles = THEME_STYLES[themeColor];

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newEffect = {
      id: Date.now(),
      x,
      y,
      text: "+1",
    };

    setClickEffects((prev) => [...prev, newEffect]);
    setTimeout(() => {
      setClickEffects((prev) =>
        prev.filter((effect) => effect.id !== newEffect.id)
      );
    }, 800);

    onVote(option.id);
  };

  return (
    <div
      className={`bg-white rounded-2xl md:rounded-[2rem] p-4 md:p-8 flex flex-col items-center text-center shadow-lg border border-slate-100 ${styles.border} transition-all cursor-pointer group relative overflow-hidden active:scale-95 duration-100`}
      onClick={handleClick}
    >
      {option.imageUrl && (
        <>
          <Image
            src={option.imageUrl}
            alt={option.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-black/50" />
        </>
      )}
      {/* Click Effects */}
      {clickEffects.map((effect) => (
        <div
          key={effect.id}
          className={`absolute pointer-events-none font-black text-2xl z-50 animate-float-up ${styles.text}`}
          style={{ left: effect.x, top: effect.y }}
        >
          {effect.text}
        </div>
      ))}
      <div
        className={`w-24 h-24 md:w-48 md:h-48 rounded-full border-2 md:border-4 border-dashed ${styles.circleBorder} mb-3 md:mb-6 p-1 md:p-2 relative md:group-hover:scale-105 transition-transform duration-300 animate-pulse-strong md:animate-none`}
      >
        <div
          className={`w-full h-full rounded-full ${styles.circleBg} overflow-hidden relative`}
        >
          <div className={`absolute inset-0 ${styles.placeholderBg}`} />
        </div>
      </div>
      <h3
        className={`text-lg md:text-2xl font-black mb-1 md:mb-2 break-keep z-10 ${
          option.imageUrl ? "text-white" : "text-slate-800"
        }`}
      >
        {option.name}
      </h3>

      <Button
        variant="none"
        className={`${styles.bg} ${styles.text} h-auto px-4 md:px-8 py-2 md:py-3 rounded-full font-bold text-xs md:text-sm transition-all shadow-sm flex items-center gap-1 md:gap-2 whitespace-nowrap animate-bounce-subtle md:animate-none z-10 border-0`}
      >
        <span className="hidden md:inline">Tap to Vote!</span>
        <span className="md:hidden">Vote</span>
      </Button>
    </div>
  );
};
