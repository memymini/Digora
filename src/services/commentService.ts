import { createClient } from "@/lib/supabase/server";
import { commentsMapper, singleCommentMapper } from "@/utils/mappers";
import { SupabaseClient } from "@supabase/supabase-js";
/**
 * 특정 투표의 댓글 목록 조회
 */

export const commentService = {
  async getComments(voteId: number) {
    const supabase = await createClient();

    // 1. Get User Session (for isUserVoted check)
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    // 2. Parallel Fetch: Comments and User Vote Status
    const [commentsRes, userVoteRes] = await Promise.all([
      supabase
        .from("comments")
        .select(
          `
        id, 
        body, 
        created_at, 
        parent_id, 
        likes_count,
        user_id,
        badge_label,
        profiles ( role )
      `
        )
        .eq("vote_id", voteId)
        .eq("visibility", "active")
        .order("created_at", { ascending: true }),
      userId
        ? supabase
            .from("ballots")
            .select("id")
            .eq("vote_id", voteId)
            .eq("user_id", userId)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    if (commentsRes.error) throw commentsRes.error;
    const isUserVoted = !!userVoteRes.data;

    // 🧩 mapper를 통해 익명화 및 트리 구조 변환
    const mappedComments = commentsMapper(commentsRes.data);

    return {
      ...mappedComments,
      isUserVoted,
    };
  },

  async createComment(voteId: number, content: string, parentId?: number) {
    const supabase = await createClient();

    // ✅ 현재 로그인된 유저 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("UNAUTHORIZED");
    }

    // ✅ 댓글 DB 삽입
    const { data: newComment, error } = await supabase
      .from("comments")
      .insert({
        vote_id: voteId,
        user_id: user.id,
        body: content,
        parent_id: parentId,
        visibility: "active",
        created_at: new Date().toISOString(),
      })
      .select(
        `
      id, 
      body, 
      created_at, 
      parent_id, 
      likes_count,
      profiles ( display_name, role )
    `
      )
      .single();

    if (error) throw error;

    // 🧩 단일 댓글 포맷으로 변환
    return singleCommentMapper(newComment);
  },
  async reportComment(commentId: number, userId: string, reason: string) {
    const supabase = await createClient();

    const { error } = await supabase.from("comment_reports").insert({
      comment_id: commentId,
      reporter_id: userId,
      reason: reason,
      status: "pending",
      created_at: new Date().toISOString(),
    });

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
   * @param supabase - A Supabase client instance with appropriate authorization.
   * @param commentId - The ID of the comment to like/unlike.
   * @param userId - The ID of the user performing the action.
   * @returns The new liked status (true if liked, false if unliked).
   */
  async toggleLike(
    supabase: SupabaseClient,
    commentId: number,
    userId: string
  ) {
    const { data, error } = await supabase.rpc("toggle_like", {
      p_comment_id: commentId,
      p_user_id: userId,
    });

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
