import { createClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

export const adminReportService = {
  async getReports(status: string | null) {
    const supabase = await createClient();

    // TODO: Add admin role check once middleware is stable
    let query = supabase.from("comment_reports").select(
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

    if (error) throw new Error(error.message);

    // Convert comment/reporter arrays to single objects
    const normalizedData = (data || []).map((item) => ({
      ...item,
      comment: Array.isArray(item.comment) ? item.comment[0] : item.comment,
      reporter: Array.isArray(item.reporter) ? item.reporter[0] : item.reporter,
    }));

    return normalizedData;
  },
  async updateReportStatus(
    supabase: SupabaseClient,
    adminId: string,
    reportId: number,
    status: string
  ) {
    // 관리자 권한 확인
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", adminId)
      .single();

    if (profileError || !profile)
      throw new Error("프로필 정보를 불러올 수 없습니다.");
    if (profile.role !== "admin") throw new Error("관리자 권한이 필요합니다.");

    // 상태값 유효성 검사
    if (!status || !["hidden", "rejected"].includes(status)) {
      throw new Error(
        "유효하지 않은 상태 값입니다. 'hidden' 또는 'rejected'만 가능합니다."
      );
    }

    // 신고 처리 함수 호출
    const { error } = await supabase.rpc("handle_report", {
      p_report_id: reportId,
      p_new_status: status,
      p_admin_id: adminId,
    });

    if (error) throw new Error(error.message);

    return { message: "신고가 처리되었습니다." };
  },
};
