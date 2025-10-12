"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { AdminVotes } from "@/lib/types";

export const VoteForm = ({
  selectedVote,
  onSubmit,
  onCancel,
}: {
  selectedVote: AdminVotes | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) => {
  const [candidateA_preview, setCandidateAPreview] = useState<string | null>(
    null
  );
  const [candidateB_preview, setCandidateBPreview] = useState<string | null>(
    null
  );

  useEffect(() => {
    setCandidateAPreview(selectedVote?.voteOptions[0].imageUrl || null);
    setCandidateBPreview(selectedVote?.voteOptions[1].imageUrl || null);
  }, [selectedVote]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setPreview: (url: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 mb-8">
      <h3 className="text-lg font-semibold">
        {selectedVote ? "투표 수정" : "새 투표 생성"}
      </h3>
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
          defaultValue={selectedVote?.title}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>
      <div>
        <label
          htmlFor="subtitle"
          className="block text-sm font-medium text-gray-700"
        >
          소제목
        </label>
        <input
          type="text"
          name="subtitle"
          id="subtitle"
          defaultValue={selectedVote?.details}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label
            htmlFor="candidateAName"
            className="block text-sm font-medium text-gray-700"
          >
            후보 1 이름
          </label>
          <input
            type="text"
            name="candidateAName"
            id="candidateAName"
            defaultValue={selectedVote?.voteOptions?.[0]?.name}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
          <label
            htmlFor="candidateA"
            className="block text-sm font-medium text-gray-700"
          >
            후보 1 이미지
          </label>
          <input
            type="file"
            name="candidateA"
            id="candidateA"
            accept="image/*"
            onChange={(e) => handleFileChange(e, setCandidateAPreview)}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
          />
          {candidateA_preview && (
            <Image
              src={candidateA_preview}
              alt="Candidate A Preview"
              width={100}
              height={100}
              className="mt-2 rounded-md object-cover"
            />
          )}
        </div>
        <div className="space-y-2">
          <label
            htmlFor="candidateBName"
            className="block text-sm font-medium text-gray-700"
          >
            후보 2 이름
          </label>
          <input
            type="text"
            name="candidateBName"
            id="candidateBName"
            defaultValue={selectedVote?.voteOptions?.[1]?.name}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
          <label
            htmlFor="candidateB"
            className="block text-sm font-medium text-gray-700"
          >
            후보 2 이미지
          </label>
          <input
            type="file"
            name="candidateB"
            id="candidateB"
            accept="image/*"
            onChange={(e) => handleFileChange(e, setCandidateBPreview)}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
          />
          {candidateB_preview && (
            <Image
              src={candidateB_preview}
              alt="Candidate B Preview"
              width={100}
              height={100}
              className="mt-2 rounded-md object-cover"
            />
          )}
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
          defaultValue={selectedVote?.endsAt}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>
      <div className="text-right space-x-2">
        {selectedVote && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button type="submit">
          {selectedVote ? "수정 완료" : "투표 생성"}
        </Button>
      </div>
    </form>
  );
};
