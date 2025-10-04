"use client";
import { createClient } from "@/lib/supabase/client"; // ✅ 이 부분 추가

export const useLogin = async () => {
  const supabase = createClient();

  await supabase.auth.signInWithOAuth({
    provider: "kakao",
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback`,
    },
  });
};
