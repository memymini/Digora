// src/components/result/VoteDistribution.tsx
"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";

interface VoteDistributionProps {
  data: { name: string; value: number }[];
  colors: string[];
}

export function VoteDistribution({ data, colors }: VoteDistributionProps) {
  return (
    <Card className="p-6 card-shadow">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="heading-2">투표 분포</h3>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
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
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
