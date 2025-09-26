"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VoteForm } from "./VoteForm";
import { createClient } from "@/lib/supabase/client";

export const VoteManagement = () => {
  const [votes, setVotes] = useState<any[]>([]);
  const [selectedVote, setSelectedVote] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchVotes = async () => {
      const { data, error } = await supabase.from("votes").select("*");
      if (data) {
        setVotes(data);
      }
      if (error) {
        console.error("Error fetching votes:", error);
      }
    };
    fetchVotes();
  }, [supabase]);

  const handleEdit = (vote: any) => {
    setSelectedVote(vote);
  };

  const handleDelete = async (voteId: number) => {
    if (window.confirm("정말로 이 투표를 삭제하시겠습니까?")) {
      const { error } = await supabase.from("votes").delete().match({ id: voteId });
      if (error) {
        alert("삭제 중 오류가 발생했습니다.");
        console.error(error);
      } else {
        setVotes(votes.filter((v) => v.id !== voteId));
        alert("투표가 삭제되었습니다.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const subtitle = formData.get("subtitle") as string;
    const duration = formData.get("duration") as string;
    const candidateAFile = formData.get("candidateA") as File;
    const candidateBFile = formData.get("candidateB") as File;

    let candidateAUrl = selectedVote?.candidate_a_url || null;
    let candidateBUrl = selectedVote?.candidate_b_url || null;

    const uploadImage = async (file: File) => {
      if (!file || file.size === 0) return null;
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from("vote-images")
        .upload(fileName, file);
      if (error) {
        console.error("Image upload error:", error);
        return null;
      }
      const { data: urlData } = supabase.storage.from("vote-images").getPublicUrl(data.path);
      return urlData.publicUrl;
    };

    if (candidateAFile?.size > 0) {
        candidateAUrl = await uploadImage(candidateAFile);
    }
    if (candidateBFile?.size > 0) {
        candidateBUrl = await uploadImage(candidateBFile);
    }

    if (!candidateAUrl || !candidateBUrl) {
        alert("이미지 업로드에 실패했습니다.");
        return;
    }

    const voteData = {
      title,
      subtitle,
      end_date: duration,
      candidate_a_url: candidateAUrl,
      candidate_b_url: candidateBUrl,
    };

    if (selectedVote) {
      // Update logic
      const { data, error } = await supabase
        .from("votes")
        .update(voteData)
        .match({ id: selectedVote.id })
        .select()
        .single();
      if (error) {
        alert("투표 수정 중 오류가 발생했습니다.");
        console.error(error);
      } else if (data) {
        setVotes(votes.map((v) => (v.id === data.id ? data : v)));
        alert("투표가 수정되었습니다.");
      }
    } else {
      // Create logic
      const { data, error } = await supabase
        .from("votes")
        .insert(voteData)
        .select()
        .single();

      if (error) {
        alert("투표 생성 중 오류가 발생했습니다.");
        console.error(error);
      } else if (data) {
        setVotes([...votes, data]);
        alert("새로운 투표가 생성되었습니다.");
      }
    }
    setSelectedVote(null);
    // Reset form by re-rendering VoteForm with no selectedVote
  };

  const handleCancel = () => {
    setSelectedVote(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ADM-01: 투표 생성 및 관리</CardTitle>
      </CardHeader>
      <CardContent>
        <VoteForm selectedVote={selectedVote} onSubmit={handleSubmit} onCancel={handleCancel} />

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
                  <p className="text-sm text-gray-600">
                    종료일: {vote.end_date}
                  </p>
                </div>
                <div className="space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(vote)}
                  >
                    수정
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(vote.id)}
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