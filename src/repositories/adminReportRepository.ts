import { SupabaseClient } from "@supabase/supabase-js";

export const adminReportRepository = {
  async getReports(client: SupabaseClient, status: string | null) {
    // TODO: Add admin role check once middleware is stable
    let query = client.from("comment_reports").select(
      `
        id,
        reason,
        status,
        created_at,
        comment:comments!inner ( id, body, created_at ),
        reporter:profiles!comment_reports_reporter_id_fkey ( id, display_name )
      `
    );

    if (status === "completed") {
      query = query.in("status", ["hidden", "rejected"]);
    } else {
      query = query.eq("status", "pending");
    }

    const { data, error } = await query.order("created_at", {
      ascending: true,
    });

    return { data, error };
  },

  async getProfile(client: SupabaseClient, userId: string) {
    const { data, error } = await client
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    return { data, error };
  },

  async handleReport(
    client: SupabaseClient,
    reportId: number,
    adminId: string,
    newStatus: string
  ) {
    const { error } = await client.rpc("handle_report", {
      p_report_id: reportId,
      p_new_status: newStatus,
      p_admin_id: adminId,
    });

    return { error };
  },
};
