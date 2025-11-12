import { createClient } from "@/lib/supabase/server";

export const adminStatisticService = {
  async getDailyStatistics() {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("daily_statistics")
      .select("*")
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching daily statistics:", error);
      throw new Error(error.message);
    }

    return data || [];
  },
};
