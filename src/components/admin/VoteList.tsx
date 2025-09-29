"use client";

import { Button } from "@/components/ui/button";

export const VoteList = ({
  votes,
  onEdit,
  onDelete,
}: {
  votes: any[];
  onEdit: (vote: any) => void;
  onDelete: (id: number) => void;
}) => {
  return (
    <div className="border-t pt-8">
      <h3 className="text-lg font-semibold mb-4">생성된 투표 목록</h3>
      <div className="space-y-4">
        {votes.map((vote) => (
          <div
            key={vote.id}
            className="p-4 border rounded-md flex justify-between items-center"
          >
            <div>
              <p className="font-bold">{vote.title}</p>
              <p className="text-sm text-gray-600">종료일: {vote.endDate}</p>
            </div>
            <div className="space-x-2">
              <Button size="sm" variant="outline" onClick={() => onEdit(vote)}>
                수정
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(vote.id)}
              >
                삭제
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
