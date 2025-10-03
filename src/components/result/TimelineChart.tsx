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
import { TrendingUp } from "lucide-react";
import { ChartCard } from "@/components/common/ChartCard";
import { Option, TimelineDistribution } from "@/lib/types";

// 후보자 정보를 담는 타입
interface TimelineChartProps {
  data: TimelineDistribution[];
  candidates: Option[];
}

const COLORS = ["#4169E1", "#DC143C", "#20B2AA", "#FF8C00"];

export const TimelineChart = ({ data, candidates }: TimelineChartProps) => {
  // Recharts가 사용하기 쉽도록 데이터 구조를 변환합니다.
  // e.g., { time: '09:00', 1: 150, 2: 120 }
  const transformedData = data.map((point) => {
    const dataPoint: { [key: string]: string | number } = {
      time: point.date,
    };
    point.results.forEach((result) => {
      dataPoint[result.id] = result.count;
    });
    return dataPoint;
  });

  return (
    <ChartCard title="시간대별 투표 추이" icon={TrendingUp}>
      <ResponsiveContainer width="100%" height={256}>
        <LineChart data={transformedData}>
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
          {candidates.map((candidate, index) => (
            <Line
              key={candidate.id}
              type="monotone"
              dataKey={String(candidate.id)}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={3}
              name={candidate.name}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
