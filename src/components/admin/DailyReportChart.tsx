"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface DailyReportResponse {
  date: string;
  daily_visitors: number;
  total_users: number;
  daily_votes: number;
  daily_comments: number;
}

interface Props {
  data: DailyReportResponse[];
}

export default function DailyReportChart({ data }: Props) {
  // ✅ 월별 사용자 통계 집계
  const monthlyData = useMemo(() => {
    const map = new Map<
      string,
      { month: string; visitors: number; votes: number; comments: number }
    >();

    data.forEach((d) => {
      const month = d.date.slice(0, 7); // YYYY-MM
      if (!map.has(month)) {
        map.set(month, {
          month,
          visitors: 0,
          votes: 0,
          comments: 0,
        });
      }
      const entry = map.get(month)!;
      entry.visitors += d.daily_visitors;
      entry.votes += d.daily_votes;
      entry.comments += d.daily_comments;
    });

    return Array.from(map.values());
  }, [data]);

  return (
    <div className="flex flex-col gap-12">
      {/* 🗓️ 일별 트렌드 */}
      <section>
        <h2 className="text-lg font-semibold mb-4">일별 사용자 트렌드</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="daily_visitors"
              stroke="#4F46E5"
              name="일일 방문자"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="daily_votes"
              stroke="#F59E0B"
              name="일일 투표 수"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="daily_comments"
              stroke="#10B981"
              name="일일 댓글 수"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* 📅 월별 사용자 추세 */}
      <section>
        <h2 className="text-lg font-semibold mb-4">월별 사용자 분석</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="visitors" fill="#4F46E5" name="방문자 수" />
            <Bar dataKey="votes" fill="#F59E0B" name="투표 수" />
            <Bar dataKey="comments" fill="#10B981" name="댓글 수" />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
