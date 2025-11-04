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
  variant?: "hero" | "vote" | null;
  isFlipped?: boolean;
  onFlip?: () => void;
}

export const CandidateProfile = ({
  candidate,
  isSelected,
  isVoted,
  optionId,
  onSelect,
  color,
  isWinner = false,
  variant,
  isFlipped,
  onFlip,
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
    (onSelect && !isVoted && isSelected) ||
    isWinner
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
      onClick={() => {
        if (variant === "vote" && onFlip) onFlip();
        if (onSelect) onSelect();
      }}
    >
      <div
        className={cn(
          "relative w-full [perspective:1000px] transition-transform duration-500",
          variant === "hero" && "animate-competitive-pulse hover:scale-105",
          variant === "hero" && colorClasses[color].shadow
        )}
      >
        {/* 카드 컨테이너 */}
        <div
          className={cn(
            "w-full relative aspect-[3/4] transition-transform duration-700 [transform-style:preserve-3d]",
            isFlipped && "[transform:rotateY(180deg)]"
          )}
        >
          {/* 앞면 */}
          <div
            className={cn(
              "absolute inset-0 rounded-lg overflow-hidden backface-hidden w-full",
              ringClass
            )}
          >
            <Image
              src={candidate.imageUrl!}
              alt={candidate.name}
              fill
              className="object-cover"
            />
            <div
              className={`absolute inset-0 ${
                color === "blue" ? "bg-vote-blue/10" : "bg-vote-red/10"
              }`}
            />
          </div>

          {/* 뒷면 */}
          <ul
            className={cn(
              "absolute inset-0 rounded-lg [transform:rotateY(180deg)] backface-hidden bg-black/70 backdrop-blur-md flex justify-center text-white p-2 sm:p-4 flex-col list-disc list-outside pl-4 sm:pl-8 text-justify",
              ringClass
            )}
          >
            {candidate.descriptions?.map((d, idx) => (
              <li key={idx} className="text-xs sm:text-lg font-semibold ">
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="text-center mt-4">
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
