import { createErrorResponse } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiResponse, CommentResponse } from "@/lib/types";

export const revalidate = 0;

// GET /api/votes/[id]/comments - 댓글 목록 조회
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<CommentResponse[]>>> {
  const { id } = await params;
  try {
    const voteId = parseInt(id, 10);
    if (isNaN(voteId)) {
      return createErrorResponse("INVALID_INPUT", 400, "Invalid vote ID");
    }

    const supabase = await createClient();

    // 1. 투표 정보와 댓글 목록을 병렬로 조회
    const [voteRes, commentsRes] = await Promise.all([
      supabase.from("votes").select("created_by").eq("id", voteId).single(),
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
    ]);

    if (voteRes.error) throw voteRes.error;
    if (commentsRes.error) throw commentsRes.error;

    const commentsData = commentsRes.data || [];

    // 2. 댓글 작성자들의 고유 ID 목록 생성 및 익명 ID 매핑
    const userToAnonymousIdMap = new Map<string, number>();
    let anonymousIdCounter = 1;
    commentsData.forEach((comment) => {
      if (comment.user_id && !userToAnonymousIdMap.has(comment.user_id)) {
        userToAnonymousIdMap.set(comment.user_id, anonymousIdCounter++);
      }
    });

    // 3. 중첩 구조로 변환 및 익명 닉네임/뱃지 적용
    const commentsMap = new Map<number, CommentResponse>();
    const rootComments: CommentResponse[] = [];

    commentsData.forEach((comment) => {
      const anonymousId = comment.user_id
        ? userToAnonymousIdMap.get(comment.user_id)
        : 0;
      let authorName = `익명${anonymousId}`;
      const badge = comment.badge_label || "";

      if (badge) {
        authorName = `${authorName} (${badge})`;
      }

      const formattedComment: CommentResponse = {
        id: comment.id,
        content: comment.body,
        author: authorName,
        badge: badge, // badge 필드도 채워줌
        likes: comment.likes_count ?? 0,
        createdAt: new Date(comment.created_at).toLocaleString(),
        replies: [],
      };
      commentsMap.set(comment.id, formattedComment);
    });

    commentsData.forEach((comment) => {
      const formattedComment = commentsMap.get(comment.id);
      if (formattedComment) {
        if (comment.parent_id && commentsMap.has(comment.parent_id)) {
          commentsMap.get(comment.parent_id)!.replies!.push(formattedComment);
        } else {
          rootComments.push(formattedComment);
        }
      }
    });

    return NextResponse.json({ success: true, data: rootComments });
  } catch (e) {
    const error = e as Error;
    return createErrorResponse("DB_ERROR", 500, error.message);
  }
}

// POST /api/votes/[id]/comments - 댓글 생성
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<CommentResponse>>> {
  const { id } = await params;
  try {
    const voteId = parseInt(id, 10);
    if (isNaN(voteId)) {
      return createErrorResponse("INVALID_INPUT", 400, "Invalid vote ID");
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return createErrorResponse("UNAUTHORIZED", 401, "로그인이 필요합니다.");
    }

    const { content, parentId } = await req.json();
    if (!content) {
      return createErrorResponse("INVALID_INPUT", 400, "댓글 내용이 없습니다.");
    }

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

    // POST 응답에서는 익명 처리를 하지 않고, 생성된 댓글의 정보를 그대로 반환합니다.
    // GET 요청 시 목록 전체가 다시 조회되면서 익명화가 적용됩니다.
    const profile = Array.isArray(newComment.profiles)
      ? newComment.profiles[0]
      : newComment.profiles;

    const formattedComment: CommentResponse = {
      id: newComment.id,
      content: newComment.body,
      author: profile?.display_name ?? "익명",
      badge: profile?.role ?? "user",
      likes: newComment.likes_count ?? 0,
      createdAt: new Date(newComment.created_at).toLocaleString(),
      replies: [],
    };

    return NextResponse.json({ success: true, data: formattedComment });
  } catch (e) {
    const error = e as Error;
    return createErrorResponse("DB_ERROR", 500, error.message);
  }
}
