"use client";
import { Card } from "@/components/ui/card";
import { Candidate } from "@/lib/types";
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

interface AgeDemographicsChartProps {
  data: {
    key: string;
    results: { count: number }[];
  }[];
  candidateAName: string;
  candidateBName: string;
}

export function AgeDemographicsChart({
  data,
  candidateAName,
  candidateBName,
}: AgeDemographicsChartProps) {
  return (
    <Card className="p-6 card-shadow">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="heading-2">연령대별 투표 현황</h3>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data.map((group) => ({
              key: group.key,
              candidateA: group.results[0]?.count,
              candidateB: group.results[1]?.count,
            }))}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
            <XAxis dataKey="key" tick={{ fontSize: 12 }} />
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
            <Bar dataKey="candidateA" fill="#4169E1" name={candidateAName} />
            <Bar dataKey="candidateB" fill="#DC143C" name={candidateBName} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
