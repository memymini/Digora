"use client";

import { useCountdown } from "@/hooks/useCountdown";
import { Clock } from "lucide-react";

interface VoteCountdownProps {
  endsAt: string;
}

const padWithZero = (num: number) => num.toString().padStart(2, "0");

export const VoteCountdown = ({ endsAt }: VoteCountdownProps) => {
  const timeLeft = useCountdown(endsAt);
  const renderContent = () => {
    if (!timeLeft) {
      return "투표 종료";
    }

    if (timeLeft.days > 0) {
      return `D-${timeLeft.days}`;
    }

    return `${padWithZero(timeLeft.hours)}:${padWithZero(
      timeLeft.minutes
    )}:${padWithZero(timeLeft.seconds)}`;
  };

  return (
    <div className="flex items-center gap-1">
      <Clock className="w-4 h-4 text-pri" />
      <span>{renderContent()}</span>
    </div>
  );
};
