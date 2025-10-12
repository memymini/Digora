import { Users } from "lucide-react";
import { ChartCard } from "@/components/common/ChartCard";
import { Option, OverallDistribution } from "@/types";
import { mapOverallGroup } from "@/utils/mappers";

interface OverallStackedBarChartProps {
  data: OverallDistribution[];
  candidates: Option[];
}
export default function OverallStackedBarChart({
  data,
  candidates,
}: OverallStackedBarChartProps) {
  return (
    <ChartCard
      title="성별/연령별 지지 성향"
      icon={Users}
      candidates={candidates}
    >
      <div className="space-y-4 w-full h-full flex flex-col justify-around">
        {data.map((item) => {
          const candidateA = item.results[0];
          const candidateB = item.results[1];
          return (
            <div key={item.group} className="flex items-center gap-3 w-full">
              <div className="caption-text text-right font-medium">
                {mapOverallGroup(item.group)}
              </div>
              <div className="flex-1 relative h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-vote-blue transition-all duration-300"
                  style={{ width: `${candidateA.percent}%` }}
                />
                <div
                  className="absolute right-0 top-0 h-full bg-vote-red transition-all duration-300"
                  style={{ width: `${candidateB.percent}%` }}
                />
              </div>
              <div className=" caption-text text-muted-foreground">
                {candidateA.count > candidateB.count
                  ? `+${candidateA.percent - candidateB.percent}`
                  : `-${candidateB.percent - candidateA.percent}`}
                %
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}
