"use client";
import { Users } from "lucide-react";
import { ChartCard } from "@/components/common/ChartCard";
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Tooltip,
  Cell,
  Legend,
} from "recharts";
import { Option } from "@/lib/types";

interface PieChartProps {
  candidates: Option[];
}
const COLORS = ["#4169E1", "#DC143C"];
export default function PieChart({ candidates }: PieChartProps) {
  return (
    <ChartCard title="투표 분포" icon={Users}>
      <ResponsiveContainer width="100%" height={256}>
        <RechartsPieChart>
          <Pie
            data={candidates}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="count"
          >
            {candidates.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [
              value.toLocaleString() + "표",
              "득표수",
            ]}
            contentStyle={{
              backgroundColor: "#F8F9FA",
              border: "1px solid #E9ECEF",
              borderRadius: "8px",
            }}
          />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
