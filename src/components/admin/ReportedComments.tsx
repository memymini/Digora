'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const mockReportedComments = [
  { id: 1, comment: "이런 의견은 정말 문제가 많네요. 동의할 수 없습니다.", reason: "부적절한 언어 사용", reporter: "user123", status: 'pending' },
  { id: 2, comment: "말도 안 되는 소리 하지 마세요.", reason: "스팸 및 광고성 댓글", reporter: "user456", status: 'pending' },
];

const mockProcessedComments = [
  { id: 3, comment: "이 후보는 절대 안 됩니다.", reason: "특정인에 대한 비방", reporter: "user789", status: 'hidden' },
  { id: 4, comment: "광고 좀 그만하세요.", reason: "스팸 및 광고성 댓글", reporter: "user101", status: 'dismissed' },
];

export const ReportedComments = () => {
  const [activeTab, setActiveTab] = useState('pending');

  const handleHide = (id: number) => {
    alert(`${id}번 댓글 숨김 처리 로직 구현 필요`);
  };

  const handleDismiss = (id: number) => {
    alert(`${id}번 댓글 신고 기각 로직 구현 필요`);
  };

  const renderCommentList = (comments: any[]) => {
    if (comments.length === 0) {
      return <p className="text-center text-gray-500">해당하는 댓글이 없습니다.</p>;
    }
    return comments.map((report) => (
      <div key={report.id} className="p-4 border rounded-md bg-gray-50">
        <p className="font-semibold">원본 댓글:</p>
        <p className="mb-2 italic">"{report.comment}"</p>
        <p><span className="font-semibold">신고 사유:</span> {report.reason}</p>
        <p><span className="font-semibold">신고자:</span> {report.reporter}</p>
        {activeTab === 'pending' ? (
          <div className="flex justify-end space-x-2 mt-2">
            <Button variant="destructive" size="sm" onClick={() => handleHide(report.id)}>숨김</Button>
            <Button variant="secondary" size="sm" onClick={() => handleDismiss(report.id)}>기각</Button>
          </div>
        ) : (
          <p className="text-right font-semibold mt-2">
            처리 상태: {report.status === 'hidden' ? '숨김 처리됨' : '신고 기각됨'}
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
              onClick={() => setActiveTab('pending')}
              className={`${activeTab === 'pending' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              신고 접수
            </button>
            <button
              onClick={() => setActiveTab('processed')}
              className={`${activeTab === 'processed' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              처리 완료
            </button>
          </nav>
        </div>
        <div className="space-y-4">
          {activeTab === 'pending' ? renderCommentList(mockReportedComments) : renderCommentList(mockProcessedComments)}
        </div>
      </CardContent>
    </Card>
  );
};