import { createClient } from "@/lib/supabase/server";
import { commentsMapper, singleCommentMapper } from "@/lib/mappers";

/**
 * 특정 투표의 댓글 목록 조회
 */

export const commentService = {
  async getComments(voteId: number) {
    const supabase = await createClient();

    const { data: commentsData, error } = await supabase
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
      .order("created_at", { ascending: true });

    if (error) throw error;

    // 🧩 mapper를 통해 익명화 및 트리 구조 변환
    return commentsMapper(commentsData);
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
};

/**
 * 댓글 생성
 */
