"use client";
import { ChartCard } from "@/components/common/ChartCard";
import { Option } from "@/types";
import { Users } from "lucide-react";
import { WaffleChart } from "./WaffleChart";

const COLORS = ["#4169E1", "#DC143C", "#20B2AA", "#FF8C00"];

interface VoteDistributionChartProps {
  candidates: Option[];
}

export const VoteDistributionChart = ({
  candidates,
}: VoteDistributionChartProps) => {
  if (!candidates || candidates.length < 2) {
    return <div>데이터가 부족합니다.</div>;
  }

  // WaffleChart가 현재 2명의 후보만 지원한다고 가정하고, 첫 2명으로 제한합니다.
  // 향후 WaffleChart가 여러 후보를 지원하게 되면 이 로직은 변경될 수 있습니다.
  const candidateA = candidates[0];
  const candidateB = candidates[1];

  return (
    <ChartCard title="최종 득표율" icon={Users} candidates={candidates}>
      <WaffleChart
        candidateA={{
          name: candidateA.name,
          percent: candidateA.percent,
          color: COLORS[0],
        }}
        candidateB={{
          name: candidateB.name,
          percent: candidateB.percent,
          color: COLORS[1],
        }}
      />
    </ChartCard>
  );
};
