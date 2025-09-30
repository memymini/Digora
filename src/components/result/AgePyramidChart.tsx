'use client';

import { ChartCard } from "@/components/common/ChartCard";
import { Users } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";

interface AgeData {
  key: string;
  results: { count: number }[];
}

interface AgePyramidChartProps {
  data: AgeData[];
  candidateAName: string;
  candidateBName: string;
}

export const AgePyramidChart = ({
  data,
  candidateAName,
  candidateBName,
}: AgePyramidChartProps) => {
  const processedData = data.map((group) => ({
    key: group.key,
    [candidateAName]: group.results[0]?.count ?? 0,
    [candidateBName]: -(group.results[1]?.count ?? 0),
  }));

  const maxAbsValue = Math.max(
    ...processedData.flatMap((d) => [
      Math.abs(d[candidateAName] as number),
      Math.abs(d[candidateBName] as number),
    ])
  );

  return (
    <ChartCard
      title="연령대별 인구 피라미드"
      icon={<Users className="w-5 h-5 text-primary" />}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={processedData}
          stackOffset="sign"
          margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
          <XAxis
            type="number"
            domain={[-maxAbsValue, maxAbsValue]}
            tickFormatter={(value) => Math.abs(value).toLocaleString()}
            tick={{ fontSize: 12 }}
          />
          <YAxis type="category" dataKey="key" width={40} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: number) => [Math.abs(value).toLocaleString() + "표", null]}
            contentStyle={{
              backgroundColor: "#F8F9FA",
              border: "1px solid #E9ECEF",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Bar dataKey={candidateAName} fill="#4169E1" stackId="stack" />
          <Bar dataKey={candidateBName} fill="#DC143C" stackId="stack" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
