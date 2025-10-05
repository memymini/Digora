import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

// Helper function to map Kakao's age range format (e.g., "20~29") to our enum
const mapKakaoAgeRange = (ageRange: string | undefined): string => {
  if (!ageRange) return 'unknown';
  const startAge = parseInt(ageRange.split('~')[0], 10);
  if (startAge >= 60) return '60s_plus';
  if (startAge >= 10) return `${startAge}s`;
  return 'unknown';
};

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Error exchanging code for session:", exchangeError);
      const redirectUrl = new URL("/", request.url);
      redirectUrl.searchParams.set("error", "auth_error");
      return NextResponse.redirect(redirectUrl);
    }

    // After successful login, check and create a profile if it doesn't exist
    if (sessionData.user) {
      const user = sessionData.user;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!profile) {
        const { error: createProfileError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            // Kakao-specific metadata
            kakao_user_id: user.user_metadata.provider_id,
            display_name: user.user_metadata.full_name,
            role: 'user', // Default role for new users
            gender: user.user_metadata.gender || 'unknown',
            age_group: mapKakaoAgeRange(user.user_metadata.age_range),
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

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin);
}