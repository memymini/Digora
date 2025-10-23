import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

// Helper function to map Kakao's age range format (e.g., "20~29") to our enum
const mapKakaoAgeRange = (ageRange: string | undefined): string => {
  if (!ageRange) return "unknown";
  const startAge = parseInt(ageRange.split("~")[0], 10);
  if (startAge >= 60) return "60s_plus";
  if (startAge >= 20) return `${startAge}s`;
  if (startAge < 20) return "20s_under";
  return "unknown";
};

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data: sessionData, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Error exchanging code for session:", exchangeError);
      const redirectUrl = new URL("/", request.url);
      redirectUrl.searchParams.set("error", "auth_error");
      return NextResponse.redirect(redirectUrl);
    }

    // After successful login, check and create a profile if it doesn't exist
    if (sessionData.user) {
      const user = sessionData.user;

      // Get current session to extract provider_token (Kakao access token)
      const { data: currentSessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) {
        console.error("Error getting current session:", sessionError);
      }

      let kakaoGender = user.user_metadata.gender || "unknown";
      let kakaoAgeRange = user.user_metadata.age_range;
      let kakaoBirthYear = user.user_metadata.birth_year || "unknown";

      const accessToken = currentSessionData?.session?.provider_token;
      if (accessToken) {
        try {
          const kakaoRes = await fetch("https://kapi.kakao.com/v2/user/me", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const kakaoUser = await kakaoRes.json();

          if (kakaoUser.kakao_account) {
            kakaoGender = kakaoUser.kakao_account.gender || kakaoGender;
            kakaoAgeRange = kakaoUser.kakao_account.age_range || kakaoAgeRange;
            kakaoBirthYear =
              kakaoUser.kakao_account.birthyear || kakaoBirthYear;
          }
        } catch (fetchError) {
          console.error("Error fetching Kakao user data:", fetchError);
        }
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!profile) {
        console.log(user);
        const { error: createProfileError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            // Kakao-specific metadata
            kakao_user_id: user.user_metadata.provider_id,
            display_name: user.user_metadata.full_name,
            role: "user", // Default role for new users
            gender: kakaoGender || "unknown",
            age_group: mapKakaoAgeRange(kakaoAgeRange),
            birth_year: kakaoBirthYear || "unknown",
          });

        if (createProfileError) {
          console.error("Failed to create user profile:", createProfileError);
          // Redirect with an error, but the user is technically logged in
          const redirectUrl = new URL("/", request.url);
          redirectUrl.searchParams.set("error", "profile_creation_failed");
          return NextResponse.redirect(redirectUrl);
        }
      }
    }
  }

  const returnTo = requestUrl.searchParams.get("returnTo") || "/";
  return NextResponse.redirect(new URL(returnTo, requestUrl.origin));
}
