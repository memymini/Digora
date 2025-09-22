import { TrendingUp } from "lucide-react";

interface VoteHeaderProps {
  title: string;
  description: string;
  totalVotes: number;
  isActive: boolean;
}

export const VoteHeader = ({
  title,
  description,
  totalVotes,
  isActive,
}: VoteHeaderProps) => {
  return (
    <div className="mb-8">
      <h1 className="heading-2 sm:heading-1 mb-4">{title}</h1>
      <p className="body-text text-muted-foreground mb-6">{description}</p>
      <div className="flex items-center gap-6 caption-text text-muted-foreground">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          <span>{totalVotes.toLocaleString()}명 참여</span>
        </div>
        {isActive ? (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span>진행중</span>
          </div>
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
