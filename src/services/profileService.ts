import { SupabaseClient, User } from "@supabase/supabase-js";
import { KakaoUserData } from "@/types/domain";
import { ROLE } from "@/types/enums";
import { mapKakaoAgeRange } from "@/utils/mappers";
import { profileRepository } from "@/repositories/profileRepository";

const DEFAULT_UNKNOWN = "unknown";

export const profileService = {
  /**
   * 프로필이 없으면 생성 (upsert 방식)
   */
  async ensureProfile(
    client: SupabaseClient,
    user: User,
    kakaoData: KakaoUserData
  ): Promise<{ success: boolean; error?: unknown }> {
    const { error } = await profileRepository.upsert(client, {
      id: user.id,
      kakao_user_id: user.user_metadata.provider_id,
      display_name: user.user_metadata.full_name,
      role: ROLE.USER,
      gender: kakaoData.gender || DEFAULT_UNKNOWN,
      age_group: mapKakaoAgeRange(kakaoData.ageRange),
      birth_year: kakaoData.birthYear || DEFAULT_UNKNOWN,
    });

    if (error) {
      console.error("Failed to ensure user profile:", error);
      return { success: false, error };
    }

    return { success: true };
  },
};
