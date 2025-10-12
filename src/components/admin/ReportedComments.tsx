"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReportedCommentsQuery } from "@/hooks/queries/useReportedCommentsQuery";
import { useHandleReportMutation } from "@/hooks/mutations/useHandleReportMutation";
import { ReportedComment } from "@/lib/types";

export const ReportedComments = () => {
  const [activeTab, setActiveTab] = useState("pending"); // 'pending' or 'processed'
  const status = activeTab === "pending" ? "pending" : "completed";

  const {
    data: reports = [],
    isLoading,
    isError,
    error,
  } = useReportedCommentsQuery(status);

  const handleReportMutation = useHandleReportMutation();

  const handleAction = (reportId: number, status: "hidden" | "rejected") => {
    const action = status === "hidden" ? "숨김" : "기각";
    if (window.confirm(`정말로 이 신고를 [${action}] 처리하시겠습니까?`)) {
      handleReportMutation.mutate(
        { reportId, status },
        {
          onSuccess: () => {
            alert(`신고가 성공적으로 [${action}] 처리되었습니다.`);
          },
          onError: (err) => {
            alert(`처리 중 오류가 발생했습니다: ${err.message}`);
          },
        }
      );
    }
  };

  const renderCommentList = (comments: ReportedComment[]) => {
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
    if (comments.length === 0) {
      return (
        <p className="text-center text-gray-500">해당하는 댓글이 없습니다.</p>
      );
    }
    return comments.map((report) => (
      <div key={report.id} className="p-4 border rounded-md bg-gray-50">
        <p className="font-semibold">원본 댓글:</p>
        <p className="mb-2 italic">&quot;{report.comment.body}&quot;</p>
        <p>
          <span className="font-semibold">신고 사유:</span> {report.reason}
        </p>
        <p>
          <span className="font-semibold">신고자:</span>
          {report.reporter.name || "알 수 없음"}
        </p>
        <p className="text-sm text-gray-400">
          신고일: {new Date(report.createdAt).toLocaleString()}
        </p>
        {activeTab === "pending" ? (
          <div className="flex justify-end space-x-2 mt-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleAction(report.id, "hidden")}
            >
              숨김
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleAction(report.id, "rejected")}
            >
              기각
            </Button>
          </div>
        ) : (
          <p className="text-right font-semibold mt-2">
            처리 상태:{" "}
            {report.status === "hidden" ? "숨김 처리됨" : "신고 기각됨"}
          </p>
        )}
      </div>
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ADM-02: 신고된 댓글 관리</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border-b mb-4">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("pending")}
              className={`${
                activeTab === "pending"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              신고 접수
            </button>
            <button
              onClick={() => setActiveTab("processed")}
              className={`${
                activeTab === "processed"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              처리 완료
            </button>
          </nav>
        </div>
        <div className="space-y-4">{renderCommentList(reports)}</div>
      </CardContent>
    </Card>
  );
};
