import { SupabaseClient } from "@supabase/supabase-js";

export const adminStatisticRepository = {
  async getDailyStatistics(client: SupabaseClient) {
    const { data, error } = await client
      .from("daily_statistics")
      .select("*")
      .order("date", { ascending: true });

    return { data, error };
  },
};
