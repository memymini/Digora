import { SupabaseClient } from "@supabase/supabase-js";
import { adminReportRepository } from "@/repositories/adminReportRepository";

export const adminReportService = {
  async getReports(client: SupabaseClient, status: string | null) {
    const { data, error } = await adminReportRepository.getReports(
      client,
      status
    );

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
    client: SupabaseClient,
    adminId: string,
    reportId: number,
    status: string
  ) {
    // 관리자 권한 확인
    const { data: profile, error: profileError } =
      await adminReportRepository.getProfile(client, adminId);

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
    const { error } = await adminReportRepository.handleReport(
      client,
      reportId,
      adminId,
      status
    );

    if (error) throw new Error(error.message);

    return { message: "신고가 처리되었습니다." };
  },
};
