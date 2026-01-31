import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { KakaoUserData } from "@/types/domain";
import { GENDER } from "@/types/enums";
import { kakaoService } from "@/services/kakaoService";
import { profileService } from "@/services/profileService";
import { createErrorRedirect } from "@/utils/api";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();

    // 인증 코드로 세션 교환
    const { data: authData, error: authError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (authError) {
      console.error("Error exchanging code for session:", authError);
      return createErrorRedirect(request.url, "auth_error");
    }

    if (authData.user) {
      const user = authData.user;

      // 카카오 API용 토큰 조회
      const { data: session, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error getting session:", sessionError);
        return createErrorRedirect(request.url, "auth_error");
      }

      // 카카오 API에서 추가 정보 조회
      const accessToken = session?.session?.provider_token;
      const defaultKakaoData: KakaoUserData = {
        gender: user.user_metadata.gender || GENDER.UNKNOWN,
        ageRange: user.user_metadata.age_range,
        birthYear: user.user_metadata.birth_year || GENDER.UNKNOWN,
      };
      const kakaoData = accessToken
        ? await kakaoService.fetchUserData(accessToken, defaultKakaoData)
        : defaultKakaoData;

      // 프로필 보장 (없으면 생성)
      const { success } = await profileService.ensureProfile(supabase, user, kakaoData);
      if (!success) {
        return createErrorRedirect(request.url, "profile_creation_failed");
      }
    }
  }

  const returnTo = requestUrl.searchParams.get("returnTo") || "/";
  return NextResponse.redirect(new URL(returnTo, requestUrl.origin));
}
