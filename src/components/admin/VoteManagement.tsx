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
      const { data, error } = await supabase
        .from("votes")
        .select("*, vote_options(*)");
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
      const { error } = await supabase
        .from("votes")
        .delete()
        .match({ id: voteId });
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
    const details = formData.get("subtitle") as string;
    const ends_at = formData.get("duration") as string;
    const candidateAFile = formData.get("candidateA") as File;
    const candidateBFile = formData.get("candidateB") as File;
    const candidateAName = formData.get("candidateAName") as string;
    const candidateBName = formData.get("candidateBName") as string;

    // 1. Upload images
    const uploadImage = async (file: File) => {
      if (!file || file.size === 0) return null;
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from("vote-images")
        .upload(fileName, file);
      if (error) {
        console.error("Image upload error:", error);
        throw error;
      }
      const { data: urlData } = supabase.storage
        .from("vote-images")
        .getPublicUrl(data.path);
      return urlData.publicUrl;
    };

    try {
      const [candidateAUrl, candidateBUrl] = await Promise.all([
        uploadImage(candidateAFile),
        uploadImage(candidateBFile),
      ]);

      if (selectedVote) {
        // UPDATE LOGIC
        const { data: updatedVote, error: voteUpdateError } = await supabase
          .from("votes")
          .update({ title, details, ends_at })
          .match({ id: selectedVote.id })
          .select("*, vote_options(*)")
          .single();

        if (voteUpdateError) throw voteUpdateError;

        // Update candidate names
        const optionsUpdatePromises = [
          supabase
            .from("vote_options")
            .update({ candidate_name: candidateAName })
            .match({ id: selectedVote.vote_options[0].id }),
          supabase
            .from("vote_options")
            .update({ candidate_name: candidateBName })
            .match({ id: selectedVote.vote_options[1].id }),
        ];

        await Promise.all(optionsUpdatePromises);

        // This is a bit inefficient as it refetches, but ensures UI consistency
        const { data: refetchedVote, error: refetchError } = await supabase
          .from("votes")
          .select("*, vote_options(*)")
          .eq("id", updatedVote.id)
          .single();
        if (refetchError) throw refetchError;

        setVotes(
          votes.map((v) => (v.id === refetchedVote.id ? refetchedVote : v))
        );
        alert("투표가 수정되었습니다.");
      } else {
        // CREATE LOGIC
        if (!candidateAUrl || !candidateBUrl) {
          alert("두 후보의 이미지를 모두 업로드해야 합니다.");
          return;
        }

        // 2. Insert into 'votes' table
        const { data: voteData, error: voteError } = await supabase
          .from("votes")
          .insert({
            title,
            details,
            starts_at: new Date().toISOString(),
            ends_at,
            status: "ongoing",
          })
          .select()
          .single();

        if (voteError) throw voteError;
        if (!voteData) throw new Error("Failed to create vote.");

        // 3. Insert into 'vote_options' table
        const optionsToInsert = [
          {
            vote_id: voteData.id,
            candidate_name: candidateAName || "후보 1",
            image_path: candidateAUrl,
          },
          {
            vote_id: voteData.id,
            candidate_name: candidateBName || "후보 2",
            image_path: candidateBUrl,
          },
        ];

        const { error: optionsError } = await supabase
          .from("vote_options")
          .insert(optionsToInsert);

        if (optionsError) throw optionsError;

        const { data: newVoteWithDetails, error: newVoteError } = await supabase
          .from("votes")
          .select("*, vote_options(*)")
          .eq("id", voteData.id)
          .single();
        if (newVoteError) throw newVoteError;

        setVotes([...votes, newVoteWithDetails]);
        alert("새로운 투표가 생성되었습니다.");
      }

      setSelectedVote(null);
    } catch (error) {
      console.error("Submit error:", error);
      alert("작업 중 오류가 발생했습니다.");
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
