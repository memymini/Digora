import { TrendingUp } from "lucide-react";
import { VoteCountdown } from "./VoteCountdown";

interface VoteHeaderProps {
  title: string;
  description: string;
  totalVotes: number;
  isActive: boolean;
  endsAt: string;
}

export const VoteHeader = ({
  title,
  description,
  totalVotes,
  isActive,
  endsAt,
}: VoteHeaderProps) => {
  return (
    <div className="mb-8">
      <h1 className="heading-2 sm:heading-1 mb-4">{title}</h1>
      <p className="body-text text-muted-foreground mb-6">{description}</p>
      <div className="flex items-center gap-6 caption-text justify-between text-muted-foreground">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          <span>{totalVotes.toLocaleString()}명 참여</span>
        </div>
        {isActive ? (
          <VoteCountdown endsAt={endsAt} />
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span>투표 종료</span>
          </div>
        )}
      </div>
    </div>
  );
};
