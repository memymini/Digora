import { SupabaseClient } from "@supabase/supabase-js";
import { adminStatisticRepository } from "@/repositories/adminStatisticRepository";

export const adminStatisticService = {
  async getDailyStatistics(client: SupabaseClient) {
    const { data, error } = await adminStatisticRepository.getDailyStatistics(
      client
    );

    if (error) {
      console.error("Error fetching daily statistics:", error);
      throw new Error(error.message);
    }

    return data || [];
  },
};
