import { createClient } from "@/lib/supabase/server";

export async function voteFeedService() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_vote_feed");

  if (error) {
    console.error("Supabase RPC error:", error);
    throw new Error(error.message);
  }

  return data ?? [];
}
