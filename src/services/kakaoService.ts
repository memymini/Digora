import { KakaoUserData, KakaoUserResponse } from "@/types/domain";

const KAKAO_API_URL = "https://kapi.kakao.com/v2/user/me";

export const kakaoService = {
  /**
   * 카카오 API에서 사용자 정보 조회
   */
  async fetchUserData(
    accessToken: string,
    fallbackData: KakaoUserData
  ): Promise<KakaoUserData> {
    try {
      const response = await fetch(KAKAO_API_URL, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        console.error("Kakao API returned non-OK status:", response.status);
        return fallbackData;
      }

      const kakaoUser: KakaoUserResponse = await response.json();

      if (kakaoUser.kakao_account) {
        return {
          gender: kakaoUser.kakao_account.gender || fallbackData.gender,
          ageRange:
            kakaoUser.kakao_account.age_range || fallbackData.ageRange,
          birthYear:
            kakaoUser.kakao_account.birthyear || fallbackData.birthYear,
        };
      }

      return fallbackData;
    } catch (error) {
      console.error("Error fetching Kakao user data:", error);
      return fallbackData;
    }
  },
};
