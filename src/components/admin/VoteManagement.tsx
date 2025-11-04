"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VoteForm, VoteFormSchema } from "./VoteForm";
import { AdminVotes } from "@/types";
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
  const [selectedVote, setSelectedVote] = useState<AdminVotes | null>(null);

  const deleteVoteMutation = useDeleteVoteMutation();
  const createVoteMutation = useCreateVoteMutation();
  const updateVoteMutation = useUpdateVoteMutation();

  const form = useForm<VoteFormSchema>({
    defaultValues: {
      title: "",
      details: "",
      ends_at: "",
      options: [
        { name: "", descriptions: "", file: undefined },
        { name: "", descriptions: "", file: undefined },
      ],
    },
  });

  useEffect(() => {
    if (selectedVote) {
      form.reset({
        title: selectedVote.title,
        details: selectedVote.details,
        ends_at: selectedVote.endsAt.split("T")[0], // Format for date input
        options: selectedVote.voteOptions.map((opt) => ({
          id: opt.id,
          name: opt.name,
          descriptions: (opt.descriptions || []).join('\n'),
          imageUrl: opt.imageUrl,
          file: undefined,
        })),
      });
    } else {
      form.reset({
        title: "",
        details: "",
        ends_at: "",
        options: [
          { name: "", descriptions: "", file: undefined },
          { name: "", descriptions: "", file: undefined },
        ],
      });
    }
  }, [selectedVote, form]);

  const handleEdit = (vote: AdminVotes) => {
    setSelectedVote(vote);
  };

  const handleDelete = (voteId: number) => {
    if (window.confirm("정말로 이 투표를 삭제하시겠습니까?")) {
      deleteVoteMutation.mutate(voteId, {
        onSuccess: () => alert("투표가 삭제되었습니다."),
        onError: (err) => alert(`삭제 중 오류: ${err.message}`),
      });
    }
  };

  const onSubmit: SubmitHandler<VoteFormSchema> = async (data) => {
    const commonMutationOptions = {
      onSuccess: () => {
        alert(
          selectedVote ? "투표가 수정되었습니다." : "새 투표가 생성되었습니다."
        );
        setSelectedVote(null);
      },
      onError: (err: Error) => alert(`작업 중 오류: ${err.message}`),
    };

    if (selectedVote) {
      // Update
      updateVoteMutation.mutate(
        {
          voteId: selectedVote.id,
          title: data.title,
          details: data.details,
          ends_at: data.ends_at,
          options: data.options.map((opt, index) => ({
            id: selectedVote.voteOptions[index].id,
            candidate_name: opt.name,
            descriptions: opt.descriptions || "",
            file: opt.file?.[0],
          })),
        },
        commonMutationOptions
      );
    } else {
      // Create
      if (data.options.some((opt) => !opt.file || opt.file.length === 0)) {
        alert("모든 후보의 이미지를 업로드해야 합니다.");
        return;
      }
      createVoteMutation.mutate(
        {
          title: data.title,
          details: data.details,
          ends_at: data.ends_at,
          options: data.options.map(opt => ({
            name: opt.name,
            descriptions: opt.descriptions || "",
            file: opt.file![0],
          }))
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
          form={form}
          onSubmit={onSubmit}
          onCancel={handleCancel}
          selectedVote={selectedVote}
        />

        <div className="border-t pt-8 mt-8">
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
                    종료일: {new Date(vote.endsAt).toLocaleString()}
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
