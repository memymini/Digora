# Refactoring Log

## 2026-01-31: Auth Callback 리팩토링

### 변경 파일
- `src/app/api/auth/callback/route.ts`
- `src/app/page.tsx`
- `src/services/kakaoService.ts` (신규)
- `src/services/profileService.ts` (신규)
- `src/repositories/profileRepository.ts` (신규)
- `src/utils/api.ts`
- `src/utils/mappers.ts`
- `src/types/domain.ts`
- `src/types/request.ts`

### 주요 변경 사항

#### 1. 레이어 분리
| 레이어 | 파일 | 역할 |
|--------|------|------|
| Route | `callback/route.ts` | 요청/응답 처리만 담당 |
| Service | `kakaoService.ts` | 카카오 API 호출 |
| Service | `profileService.ts` | 프로필 비즈니스 로직 |
| Repository | `profileRepository.ts` | DB 접근 (upsert) |

#### 2. 유틸리티 정리
| 함수 | 위치 | 역할 |
|------|------|------|
| `createErrorRedirect` | `utils/api.ts` | 에러 리다이렉트 생성 |
| `mapKakaoAgeRange` | `utils/mappers.ts` | 카카오 연령대 → 앱 형식 변환 |

#### 3. 타입 추가
| 타입 | 위치 |
|------|------|
| `KakaoAccount`, `KakaoUserResponse`, `KakaoUserData` | `types/domain.ts` |
| `CreateProfileRequest` | `types/request.ts` |

#### 4. 에러 처리 개선
- URL param으로 에러 전달 → 메인 페이지에서 toast 표시 후 URL 정리

#### 5. DB 최적화
- `exists()` + `create()` → `ensureProfile()` (upsert)
- 2회 DB 요청 → 1회로 감소, Race condition 방지

### Before/After
| 항목 | Before | After |
|------|--------|-------|
| route.ts 라인 수 | 99줄 | 65줄 |
| 서비스 파일 | 0개 | 2개 |
| Repository 파일 | 0개 | 1개 |
| DB 요청 | 2회 | 1회 |
| 타입 안전성 | 없음 | 있음 |
