import { useQueryClient } from "@tanstack/react-query";
import { VOTE_QUERY_KEYS } from "../queries/querykeys";
import toast from "react-hot-toast";
import { http } from "@/lib/fetcher";
import { CommentResponse } from "@/types";
import { useApiMutation } from "../useApiMutation";

interface PostVoteCommentParams {
  voteId: number;
  content: string;
  parentId?: number;
}

export const postVoteComment = async ({
  voteId,
  content,
  parentId,
}: PostVoteCommentParams) => {
  return http.post<CommentResponse>(`/api/votes/${voteId}/comments`, {
    content,
    parentId,
  });
};

interface UseVoteCommentMutationParams {
  voteId: number;
}

export function useVoteCommentMutation({
  voteId,
}: UseVoteCommentMutationParams) {
  const queryClient = useQueryClient();

  return useApiMutation(
    ({ content, parentId }: { content: string; parentId?: number }) =>
      postVoteComment({ voteId, content, parentId }),
    {
      onSuccess: () => {
        toast.success("댓글이 등록되었습니다.");
        queryClient.invalidateQueries({
          queryKey: VOTE_QUERY_KEYS.comments(voteId),
        });
      },
    }
  );
}
