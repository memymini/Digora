"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartCard } from "@/components/common/ChartCard";
import { TrendingUp } from "lucide-react";

interface HourlyData {
  time: string;
  candidateA: number;
  candidateB: number;
}

interface HourlyTrendChartProps {
  data: HourlyData[];
  candidateAName: string;
  candidateBName: string;
}

export const HourlyTrendChart = ({
  data,
  candidateAName,
  candidateBName,
}: HourlyTrendChartProps) => {
  return (
    <ChartCard
      title="시간대별 투표 추이"
      icon={<TrendingUp className="w-5 h-5 text-primary" />}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            labelStyle={{ color: "#2F2F2F" }}
            contentStyle={{
              backgroundColor: "#F8F9FA",
              border: "1px solid #E9ECEF",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="candidateA"
            stroke="#4169E1"
            strokeWidth={3}
            name={candidateAName}
          />
          <Line
            type="monotone"
            dataKey="candidateB"
            stroke="#DC143C"
            strokeWidth={3}
            name={candidateBName}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
