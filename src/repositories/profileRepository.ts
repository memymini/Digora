import { SupabaseClient } from "@supabase/supabase-js";
import { CreateProfileRequest } from "@/types/request";

export const profileRepository = {
  async upsert(client: SupabaseClient, profileData: CreateProfileRequest) {
    const { data, error } = await client
      .from("profiles")
      .upsert(profileData, { onConflict: "id", ignoreDuplicates: true });

    return { data, error };
  },
};
