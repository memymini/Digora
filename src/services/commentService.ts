import { createClient } from "@/lib/supabase/server";
import { commentsMapper, singleCommentMapper } from "@/lib/mappers";

/**
 * 특정 투표의 댓글 목록 조회
 */
export async function getComments(voteId: number) {
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
}

/**
 * 댓글 생성
 */
export async function createComment(
  voteId: number,
  content: string,
  parentId?: number
) {
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
}
