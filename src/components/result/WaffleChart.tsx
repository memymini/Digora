import { useState } from "react";

interface WaffleChartProps {
  candidateA: {
    name: string;
    votes: number;
    color: string;
  };
  candidateB: {
    name: string;
    votes: number;
    color: string;
  };
  totalVotes: number;
}

export function WaffleChart({
  candidateA,
  candidateB,
  totalVotes,
}: WaffleChartProps) {
  const [hoveredSquare, setHoveredSquare] = useState<{
    index: number;
    candidate: string;
    percentage: number;
  } | null>(null);

  const candidateAPercent = Math.round((candidateA.votes / totalVotes) * 100);
  const candidateBPercent = 100 - candidateAPercent;

  // 100개의 사각형을 생성하고 각각에 후보 할당
  const squares = Array.from({ length: 100 }, (_, index) => {
    if (index < candidateAPercent) {
      return {
        candidate: "A",
        name: candidateA.name,
        color: candidateA.color,
        percentage: candidateAPercent,
      };
    } else {
      return {
        candidate: "B",
        name: candidateB.name,
        color: candidateB.color,
        percentage: candidateBPercent,
      };
    }
  });

  return (
    <div className="relative">
      {/* 와플 차트 그리드 */}
      <div className="grid grid-cols-10 gap-1 max-w-md mx-auto">
        {squares.map((square, index) => (
          <div
            key={index}
            className="aspect-square rounded-sm cursor-pointer transition-all duration-200 hover:scale-110 hover:z-10 relative"
            style={{ backgroundColor: square.color }}
            onMouseEnter={() =>
              setHoveredSquare({
                index,
                candidate: square.name,
                percentage: square.percentage,
              })
            }
            onMouseLeave={() => setHoveredSquare(null)}
          />
        ))}
      </div>

      {/* 범례 */}
      {/* <div className="flex items-center justify-center gap-8">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-sm"
            style={{ backgroundColor: candidateA.color }}
          />
          <span className="label-text">{candidateA.name}</span>
          <span className="label-text font-bold text-vote-blue">
            {candidateAPercent}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-sm"
            style={{ backgroundColor: candidateB.color }}
          />
          <span className="label-text">{candidateB.name}</span>
          <span className="label-text font-bold text-vote-red">
            {candidateBPercent}%
          </span>
        </div>
      </div> */}

      {/* 툴팁 */}
      {hoveredSquare && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-foreground text-background rounded-lg shadow-lg text-sm whitespace-nowrap z-20">
          <div className="text-center">
            <div className="font-semibold">{hoveredSquare.candidate}</div>
            <div>{hoveredSquare.percentage}%</div>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground" />
        </div>
      )}
    </div>
  );
}
