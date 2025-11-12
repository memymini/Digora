"use client";

import { useDailyReportQuery } from "@/hooks/queries/useDailyReport";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import DailyReportChart from "./DailyReportChart";

export const DailyReport = () => {
  const { data, isLoading, isError, error } = useDailyReportQuery();
  if (isLoading) {
    return (
      <p className="text-center text-gray-500">신고 목록을 불러오는 중...</p>
    );
  }
  if (isError) {
    return (
      <p className="text-center text-red-500">
        오류가 발생했습니다: {error.message}
      </p>
    );
  }
  if (!data) {
    return <p className="text-center text-gray-500">데이터가 없습니다.</p>;
  }
  console.log(data);
  return (
    <Card>
      <CardHeader>
        <CardTitle>ADM-03: 통계</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border-b mb-4">
          <DailyReportChart data={data} />
        </div>
      </CardContent>
    </Card>
  );
};
