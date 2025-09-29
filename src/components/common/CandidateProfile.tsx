import { Candidate } from "@/lib/types";
import Image from "next/image";

interface CandidateProfileProps {
  candidate: Candidate;
  isSelected?: boolean;
  isVoted?: boolean;
  onSelect?: () => void;
  color: "blue" | "red";
  isWinner?: boolean;
}

export const CandidateProfile = ({
  candidate,
  isSelected,
  isVoted,
  onSelect,
  color,
}: CandidateProfileProps) => {
  const colorClasses = {
    blue: {
      text: "text-vote-blue",
      ring: "ring-vote-blue",
      ringHover: "ring-vote-blue/20",
      bg: "bg-vote-blue/10",
    },
    red: {
      text: "text-vote-red",
      ring: "ring-vote-red",
      ringHover: "ring-vote-red/20",
      bg: "bg-vote-red/10",
    },
  };

  const ringClass = isVoted
    ? `${colorClasses[color].ring} ring-4`
    : isSelected
    ? colorClasses[color].ring
    : colorClasses[color].ringHover;

  return (
    <div
      className={`flex flex-col items-center transition-all duration-300 w-full ${
        isSelected ? "" : ""
      } ${onSelect && !isVoted ? "cursor-pointer" : "cursor-default"}`}
      onClick={onSelect}
    >
      <div className="relative w-[100%]">
        <div
          className={`relative aspect-[3/4] overflow-hidden mb-4 md:mb-8 ring-4 sm:ring-8 transition-all duration-300 ${ringClass}`}
        >
          <Image
            src={candidate.imageUrl}
            alt={candidate.name}
            fill
            className="object-cover grayscale"
          />
        </div>
      </div>
      <div className="text-center">
        <p
          className={`text-lg font-bold sm:heading-2 mb-1 sm:mb-2 ${colorClasses[color].text}`}
        >
          {candidate.name}
        </p>
        {isVoted && (
          <>
            <p
              className={`text-2xl sm:heading-1 font-bold ${colorClasses[color].text}`}
            >
              {candidate.percent}%
            </p>
            <p className="caption-text text-muted-foreground mt-1">
              {candidate.count}표
            </p>
          </>
        )}
      </div>
    </div>
  );
};
