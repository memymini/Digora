"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VoteForm } from "./VoteForm";
import { VoteWithOption } from "@/lib/types";
import { useAdminVotesQuery } from "@/hooks/queries/useAdminVotesQuery";
import { useDeleteVoteMutation } from "@/hooks/mutations/useDeleteVoteMutation";
import { useCreateVoteMutation } from "@/hooks/mutations/useCreateVoteMutation";
import { useUpdateVoteMutation } from "@/hooks/mutations/useUpdateVoteMutation";

export const VoteManagement = () => {
  const {
    data: votes = [],
    isLoading,
    isError,
    error: queryError,
  } = useAdminVotesQuery();
  const [selectedVote, setSelectedVote] = useState<VoteWithOption | null>(null);

  const deleteVoteMutation = useDeleteVoteMutation();
  const createVoteMutation = useCreateVoteMutation();
  const updateVoteMutation = useUpdateVoteMutation();

  const handleEdit = (vote: VoteWithOption) => {
    setSelectedVote(vote);
  };

  const handleDelete = (voteId: number) => {
    if (window.confirm("정말로 이 투표를 삭제하시겠습니까?")) {
      deleteVoteMutation.mutate(voteId, {
        onSuccess: () => {
          alert("투표가 삭제되었습니다.");
        },
        onError: (err) => {
          alert(`삭제 중 오류가 발생했습니다: ${err.message}`);
        },
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const details = formData.get("subtitle") as string;
    const ends_at = formData.get("duration") as string;
    const candidateAName = formData.get("candidateAName") as string;
    const candidateBName = formData.get("candidateBName") as string;

    const commonMutationOptions = {
      onSuccess: () => {
        alert(
          selectedVote
            ? "투표가 수정되었습니다."
            : "새로운 투표가 생성되었습니다."
        );
        setSelectedVote(null);
      },
      onError: (err: Error) => {
        alert(`작업 중 오류가 발생했습니다: ${err.message}`);
      },
    };

    if (selectedVote) {
      // Update
      updateVoteMutation.mutate(
        {
          voteId: selectedVote.id,
          title,
          details,
          ends_at,
          options: [
            {
              id: selectedVote.vote_options[0].id,
              candidate_name: candidateAName,
            },
            {
              id: selectedVote.vote_options[1].id,
              candidate_name: candidateBName,
            },
          ],
        },
        commonMutationOptions
      );
    } else {
      // Create
      const candidateAFile = formData.get("candidateA") as File;
      const candidateBFile = formData.get("candidateB") as File;

      if (
        !candidateAFile ||
        candidateAFile.size === 0 ||
        !candidateBFile ||
        candidateBFile.size === 0
      ) {
        alert("두 후보의 이미지를 모두 업로드해야 합니다.");
        return;
      }

      createVoteMutation.mutate(
        {
          title,
          details,
          ends_at,
          candidateAFile,
          candidateBFile,
          candidateAName,
          candidateBName,
        },
        commonMutationOptions
      );
    }
  };

  const handleCancel = () => {
    setSelectedVote(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ADM-01: 투표 생성 및 관리</CardTitle>
      </CardHeader>
      <CardContent>
        <VoteForm
          selectedVote={selectedVote}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />

        <div className="border-t pt-8">
          <h3 className="text-lg font-semibold mb-4">생성된 투표 목록</h3>
          {isLoading && <p>투표 목록을 불러오는 중...</p>}
          {isError && (
            <p className="text-red-500">
              오류가 발생했습니다: {queryError?.message}
            </p>
          )}
          <div className="space-y-4">
            {votes.map((vote) => (
              <div
                key={vote.id}
                className="p-4 border rounded-md flex justify-between items-center"
              >
                <div>
                  <p className="font-bold">{vote.title}</p>
                  <p className="text-sm text-gray-600">
                    종료일: {new Date(vote.ends_at).toLocaleString()}
                  </p>
                </div>
                <div className="space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(vote)}
                    disabled={updateVoteMutation.isPending}
                  >
                    수정
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(vote.id)}
                    disabled={deleteVoteMutation.isPending}
                  >
                    삭제
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
