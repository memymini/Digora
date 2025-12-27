import { SupabaseClient } from "@supabase/supabase-js";

export const commentRepository = {
  async getComments(client: SupabaseClient, voteId: number) {
    const { data, error } = await client
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

    return { data, error };
  },

  async getUserBallot(client: SupabaseClient, voteId: number, userId: string) {
    const { data, error } = await client
      .from("ballots")
      .select("id")
      .eq("vote_id", voteId)
      .eq("user_id", userId)
      .maybeSingle();

    return { data, error };
  },

  async createComment(
    client: SupabaseClient,
    voteId: number,
    userId: string,
    content: string,
    parentId?: number
  ) {
    const { data, error } = await client
      .from("comments")
      .insert({
        vote_id: voteId,
        user_id: userId,
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

    return { data, error };
  },

  async createReport(
    client: SupabaseClient,
    commentId: number,
    userId: string,
    reason: string
  ) {
    const { error } = await client.from("comment_reports").insert({
      comment_id: commentId,
      reporter_id: userId,
      reason: reason,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    return { error };
  },

  async toggleLikeRpc(
    client: SupabaseClient,
    commentId: number,
    userId: string
  ) {
    const { data, error } = await client.rpc("toggle_like", {
      p_comment_id: commentId,
      p_user_id: userId,
    });

    return { data, error };
  },
};
