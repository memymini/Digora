import { Users } from "lucide-react";
import { ChartCard } from "@/components/common/ChartCard";
import { AgeDistribution, Option } from "@/lib/types";

interface AgeStackedBarChartProps {
  data: AgeDistribution[];
  candidates: Option[];
}
export default function AgeStackedBarChart({
  data,
  candidates,
}: AgeStackedBarChartProps) {
  return (
    <ChartCard title="그룹별 지지율 분포" icon={Users} candidates={candidates}>
      <div className="space-y-3 flex flex-col justify-around h-full">
        {data.map((group) => {
          const candidateA = group.results[0];
          const candidateB = group.results[1];
          return (
            <div key={group.age} className="group">
              <div className="flex justify-between items-center mb-1">
                <span className="caption-text font-medium">{group.age}</span>
                <span className="caption-text text-muted-foreground">
                  {group.totalCount.toLocaleString()}명
                </span>
              </div>
              <div className="relative h-6 bg-muted rounded-full overflow-hidden cursor-pointer group-hover:scale-[1.02] transition-transform">
                <div
                  className="absolute left-0 top-0 h-full bg-vote-blue transition-all duration-300"
                  style={{ width: `${candidateA.percent}%` }}
                  title={`${candidates[0].name}: ${candidateA.percent}%`}
                />
                <div
                  className="absolute right-0 top-0 h-full bg-vote-red transition-all duration-300"
                  style={{ width: `${candidateB.percent}%` }}
                  title={`${candidates[1]}: ${candidateB.percent}%`}
                />
                <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-medium text-white">
                  {candidateA.percent > 15 && (
                    <span>{candidateA.percent}%</span>
                  )}
                  {candidateB.percent > 15 && (
                    <span>{candidateB.percent}%</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}
