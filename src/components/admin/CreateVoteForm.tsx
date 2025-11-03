"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const CreateVoteForm = () => {
  // TODO: Implement form state and submission logic
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("투표 생성 로직 구현 필요");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>투표 생성 및 관리</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              제목
            </label>
            <input
              type="text"
              name="title"
              id="title"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="투표 제목을 입력하세요"
            />
          </div>
          <div>
            <label
              htmlFor="subtitle"
              className="block text-sm font-medium text-gray-700"
            >
              소제목
            </label>
            <textarea
              name="subtitle"
              id="subtitle"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="투표 소제목을 입력하세요"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="candidateA"
                className="block text-sm font-medium text-gray-700"
              >
                후보 1 이미지 URL
              </label>
              <input
                type="text"
                name="candidateA"
                id="candidateA"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="이미지 URL을 입력하세요"
              />
            </div>
            <div>
              <label
                htmlFor="candidateB"
                className="block text-sm font-medium text-gray-700"
              >
                후보 2 이미지 URL
              </label>
              <input
                type="text"
                name="candidateB"
                id="candidateB"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="이미지 URL을 입력하세요"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="duration"
              className="block text-sm font-medium text-gray-700"
            >
              투표 종료일
            </label>
            <input
              type="date"
              name="duration"
              id="duration"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="text-right">
            <Button type="submit">투표 생성</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
