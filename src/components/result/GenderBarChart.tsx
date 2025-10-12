"use client";
import { ChartCard } from "@/components/common/ChartCard";
import { mapGenderChartData } from "@/utils/mappers";
import { GenderDistribution, Option } from "@/types";
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

interface GenderBarProps {
  data: GenderDistribution[];
  candidates: Option[];
}
const COLORS = ["#4169E1", "#DC143C"];

export function GenderBarChart({ data, candidates }: GenderBarProps) {
  const chartData = mapGenderChartData(data, candidates);

  return (
    <ChartCard title="성별 투표 현황" icon={Users}>
      <ResponsiveContainer width="100%" height={256}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
          <XAxis dataKey="gender" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: number) => [value.toLocaleString() + "표", ""]}
            contentStyle={{
              backgroundColor: "#F8F9FA",
              border: "1px solid #E9ECEF",
              borderRadius: "8px",
            }}
          />
          <Legend />
          {candidates.map((c, i) => (
            <Bar
              key={c.id}
              dataKey={`c${c.id}`} // id 기반 key
              name={c.name} // 라벨은 이름
              fill={COLORS[i % COLORS.length]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
