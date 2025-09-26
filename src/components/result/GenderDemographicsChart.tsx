'use client';
import { Card } from "@/components/ui/card";
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

interface GenderDemographicsChartProps {
  data: {
    key: string;
    results: { count: number; percent: number }[];
  }[];
  candidateAName: string;
  candidateBName: string;
}

export function GenderDemographicsChart({
  data,
  candidateAName,
  candidateBName,
}: GenderDemographicsChartProps) {
  const processedData = data.map((group) => ({
    key: group.key,
    candidateA: group.results[0]?.percent,
    candidateB: group.results[1]?.percent,
  }));

  return (
    <Card className="p-6 card-shadow">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="heading-2">성별 투표 현황 (100% 누적)</h3>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={processedData}
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
            <XAxis 
              type="number" 
              domain={[0, 100]} 
              tickFormatter={(tick) => `${tick}%`} 
              tick={{ fontSize: 12 }} 
            />
            <YAxis 
              type="category" 
              dataKey="key" 
              width={40} 
              tick={{ fontSize: 12 }} 
            />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)}%`, undefined]}
              contentStyle={{
                backgroundColor: "#F8F9FA",
                border: "1px solid #E9ECEF",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey="candidateA" stackId="a" fill="#4169E1" name={candidateAName} />
            <Bar dataKey="candidateB" stackId="a" fill="#DC143C" name={candidateBName} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
