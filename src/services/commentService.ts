import { commentsMapper, singleCommentMapper } from "@/utils/mappers";
import { SupabaseClient } from "@supabase/supabase-js";
import { commentRepository } from "@/repositories/commentRepository";

/**
 * 특정 투표의 댓글 목록 조회
 */

export const commentService = {
  async getComments(client: SupabaseClient, voteId: number, userId?: string) {
    // 2. Parallel Fetch: Comments and User Vote Status
    const [commentsRes, userVoteRes] = await Promise.all([
      commentRepository.getComments(client, voteId),
      userId
        ? commentRepository.getUserBallot(client, voteId, userId)
        : Promise.resolve({ data: null, error: null }),
    ]);

    if (commentsRes.error) throw commentsRes.error;
    const isUserVoted = !!userVoteRes.data;

    // 🧩 mapper를 통해 익명화 및 트리 구조 변환
    const mappedComments = commentsMapper(commentsRes.data || []);

    return {
      ...mappedComments,
      isUserVoted,
    };
  },

  async createComment(
    client: SupabaseClient,
    voteId: number,
    userId: string,
    content: string,
    parentId?: number
  ) {
    const { data: newComment, error } = await commentRepository.createComment(
      client,
      voteId,
      userId,
      content,
      parentId
    );

    if (error) throw error;

    // 🧩 단일 댓글 포맷으로 변환
    return singleCommentMapper(newComment);
  },
  async reportComment(
    client: SupabaseClient,
    commentId: number,
    userId: string,
    reason: string
  ) {
    const { error } = await commentRepository.createReport(
      client,
      commentId,
      userId,
      reason
    );

    if (error) {
      if (error.code === "23503") {
        throw new Error("NOT_FOUND:존재하지 않는 댓글입니다.");
      }
      throw error;
    }

    return { message: "신고가 접수되었습니다." };
  },
  /**
   * Toggles a 'like' on a comment for a given user.
   * Calls the `toggle_like` RPC function in the database.
   * @param client - A Supabase client instance with appropriate authorization.
   * @param commentId - The ID of the comment to like/unlike.
   * @param userId - The ID of the user performing the action.
   * @returns The new liked status (true if liked, false if unliked).
   */
  async toggleLike(
    client: SupabaseClient,
    commentId: number,
    userId: string
  ) {
    const { data, error } = await commentRepository.toggleLikeRpc(
      client,
      commentId,
      userId
    );

    if (error) {
      console.error("Error toggling like:", error);
      throw new Error(error.message);
    }

    return data as boolean;
  },
};

/**
 * 댓글 생성
 */
