import { Option } from "@/types";
import Image from "next/image";
import { cn } from "@/utils/cn";

interface CandidateProfileProps {
  candidate: Option;
  isSelected?: boolean;
  isVoted?: boolean;
  optionId?: number | null;
  onSelect?: () => void;
  color: "blue" | "red";
  isWinner?: boolean;
  variant?: "hero" | null;
}

export const CandidateProfile = ({
  candidate,
  isSelected,
  isVoted,
  optionId,
  onSelect,
  color,
  variant,
}: CandidateProfileProps) => {
  const colorClasses = {
    blue: {
      text: "text-vote-blue",
      ring: "ring-vote-blue ring-4 sm:ring-8",
      shadow: "shadow-glow-blue",
    },
    red: {
      text: "text-vote-red",
      ring: "ring-vote-red ring-4 sm:ring-8",
      shadow: "shadow-glow-red",
    },
  };
  const ringClass =
    (isVoted && optionId === candidate.id) ||
    (onSelect && !isVoted && isSelected)
      ? colorClasses[color].ring
      : variant === "hero"
      ? colorClasses[color].shadow
      : "ring-transparent";

  return (
    <div
      className={cn(
        "flex flex-col items-center w-full",
        onSelect && !isVoted ? "cursor-pointer" : "cursor-default"
      )}
      onClick={onSelect}
    >
      <div
        className={cn(
          "relative w-[100%] transition-transform duration-300",
          variant === "hero" && "animate-competitive-pulse hover:scale-105",
          variant === "hero" && colorClasses[color].shadow
        )}
      >
        <div
          className={cn(
            `relative aspect-[3/4] overflow-hidden mb-4 md:mb-8 transition-all rounded-lg duration-300 ${ringClass}`
          )}
        >
          <Image
            src={candidate.imageUrl!}
            alt={candidate.name}
            fill
            className="object-cover"
          />

          <div
            className={`absolute inset-0 flex items-center ${
              color === "blue" ? "bg-vote-blue/10" : "bg-vote-red/10"
            }`}
          />
        </div>
      </div>
      <div className="text-center">
        <p className={`text-lg font-bold sm:heading-2 mb-1 sm:mb-2`}>
          {candidate.name}
        </p>

        <>
          <p
            className={`text-2xl sm:heading-1 font-bold ${colorClasses[color].text}`}
          >
            {candidate.percent || 0}%
          </p>
          {isVoted && (
            <p className="caption-text text-muted-foreground mt-1">
              {candidate.count}표
            </p>
          )}
        </>
      </div>
    </div>
  );
};
