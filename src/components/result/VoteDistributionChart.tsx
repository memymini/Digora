"use client";

import { ChartCard } from "@/components/common/ChartCard";
import { Users } from "lucide-react";

interface Candidate {
  name: string;
  percent: number;
}

interface VoteDistributionChartProps {
  data: Candidate[];
}

const COLORS = ["#4169E1", "#DC143C"];

export const VoteDistributionChart = ({ data }: VoteDistributionChartProps) => {
  const candidateA = data[0];
  const candidateB = data[1];

  const cells = Array.from({ length: 100 }, (_, i) => {
    if (i < (candidateA?.percent || 0)) {
      return (
        <div
          key={i}
          className="w-full h-full"
          style={{ backgroundColor: COLORS[0] }}
        />
      );
    } else if (i < (candidateA?.percent || 0) + (candidateB?.percent || 0)) {
      return (
        <div
          key={i}
          className="w-full h-full"
          style={{ backgroundColor: COLORS[1] }}
        />
      );
    } else {
      return <div key={i} className="w-full h-full bg-gray-200" />;
    }
  });

  return (
    <ChartCard
      title="투표 분포"
      icon={<Users className="w-5 h-5 text-primary" />}
    >
      <div className="aspect-square w-full min-w-0 max-w-50 mx-auto">
        <div className="grid grid-cols-10 grid-rows-10 gap-1 w-full h-full">
          {cells}
        </div>
      </div>
      <div className="flex justify-center mt-4 space-x-4">
        <div className="flex items-center">
          <div
            className="w-4 h-4 mr-2"
            style={{ backgroundColor: COLORS[0] }}
          ></div>
          <span>{candidateA?.name}</span>
        </div>
        <div className="flex items-center">
          <div
            className="w-4 h-4 mr-2"
            style={{ backgroundColor: COLORS[1] }}
          ></div>
          <span>{candidateB?.name}</span>
        </div>
      </div>
    </ChartCard>
  );
};
