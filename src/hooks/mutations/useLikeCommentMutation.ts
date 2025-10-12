"use client";

import { useQueryClient } from "@tanstack/react-query";
import { http } from "@/lib/fetcher";
import { useApiMutation } from "@/hooks/useApiMutation";
import { VOTE_QUERY_KEYS } from "@/hooks/queries/querykeys";

interface LikeCommentPayload {
  commentId: number;
  voteId: number; // 댓글 목록 query를 무효화하기 위해 필요
}

// API를 호출하는 실제 함수
const likeCommentFn = (payload: LikeCommentPayload) => {
  return http.post<{ isLiked: boolean }>(
    `/api/comments/${payload.commentId}/like`,
    {}
  );
};

export const useLikeCommentMutation = () => {
  const queryClient = useQueryClient();

  return useApiMutation<{ isLiked: boolean }, LikeCommentPayload>(
    likeCommentFn,
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({
          queryKey: VOTE_QUERY_KEYS.comments(variables.voteId),
        });
      },
    }
  );
};
