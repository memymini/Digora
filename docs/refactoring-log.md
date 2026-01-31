# Refactoring Log

프로젝트 리팩토링 기록을 관리하는 문서입니다.

---

## 2026-01-31: Auth Callback Route 리팩토링

### 파일
`src/app/api/auth/callback/route.ts`

### 변경 사유
- 단일 책임 원칙 위반 (하나의 함수에서 너무 많은 작업 수행)
- 타입 안전성 부족
- 에러 처리 일관성 부족
- 매직 스트링/값 하드코딩
- 디버그 코드 잔존

### 변경 내용

#### 1. 상수 추출
```typescript
const KAKAO_API_URL = "https://kapi.kakao.com/v2/user/me";
const DEFAULT_VALUE = "unknown";
const DEFAULT_ROLE = "user";

const AUTH_ERRORS = {
  AUTH_ERROR: "auth_error",
  PROFILE_CREATION_FAILED: "profile_creation_failed",
} as const;
```

#### 2. 타입 정의 추가
```typescript
interface KakaoAccount {
  gender?: string;
  age_range?: string;
  birthyear?: string;
}

interface KakaoUserResponse {
  kakao_account?: KakaoAccount;
}

interface KakaoUserData {
  gender: string;
  ageRange: string | undefined;
  birthYear: string;
}
```

#### 3. 함수 분리

| 함수명 | 역할 |
|--------|------|
| `createErrorRedirect(baseUrl, errorCode)` | 에러 발생 시 리다이렉트 URL 생성 |
| `fetchKakaoUserData(accessToken, fallbackData)` | 카카오 API에서 사용자 정보 조회 |
| `createUserProfile(supabase, user, kakaoData)` | DB에 프로필 생성 |
| `profileExists(supabase, userId)` | 프로필 존재 여부 확인 |

#### 4. 에러 처리 개선
- `sessionError` 발생 시에도 리다이렉트 처리 (기존: 무시하고 진행)
- 카카오 API 응답 상태 코드 검증 (`response.ok` 체크)

#### 5. 제거된 항목
- `console.log(user)` 디버그 코드 제거

### Before/After 비교

| 항목 | Before | After |
|------|--------|-------|
| 코드 라인 수 | 99줄 | 116줄 |
| 함수 개수 | 2개 | 6개 |
| 타입 정의 | 없음 | 3개 인터페이스 |
| 상수 | 없음 | 4개 |
| 에러 처리 | 불일치 | 일관됨 |

---

## 2026-01-31: Auth Callback 서비스 레이어 분리

### 파일
- `src/app/api/auth/callback/route.ts` (수정)
- `src/services/kakaoService.ts` (신규)
- `src/services/profileService.ts` (신규)
- `src/types/domain.ts` (수정)
- `src/app/page.tsx` (수정)

### 변경 사유
- API route에 비즈니스 로직이 혼재
- 서비스 레이어 분리 필요 (기존 프로젝트 패턴 준수)
- 에러 처리 UX 개선 (URL param → toast)

### 변경 내용

#### 1. 서비스 분리

| 서비스 | 함수 | 역할 |
|--------|------|------|
| `kakaoService` | `mapAgeRange()` | 카카오 연령대 형식 변환 |
| `kakaoService` | `fetchUserData()` | 카카오 API 사용자 정보 조회 |
| `profileService` | `exists()` | 프로필 존재 여부 확인 |
| `profileService` | `create()` | 프로필 생성 |

#### 2. 타입 정의 이동
- `KakaoAccount`, `KakaoUserResponse`, `KakaoUserData` → `src/types/domain.ts`
- 기존 프로젝트 타입 구조에 맞게 통합

#### 3. 상수 재사용
- `DEFAULT_VALUE`, `DEFAULT_ROLE` 제거
- 기존 `GENDER.UNKNOWN`, `ROLE.USER` 재사용

#### 4. 에러 처리 UX 개선
- 메인 페이지에서 URL param 감지 → toast 표시 → URL 정리
- 사용자에게 깔끔한 에러 메시지 제공

```typescript
// src/app/page.tsx
useEffect(() => {
  const error = searchParams.get("error");
  if (error && AUTH_ERROR_MESSAGES[error]) {
    toast.error(AUTH_ERROR_MESSAGES[error]);
    router.replace("/");
  }
}, [searchParams, router]);
```

### Before/After 비교

| 항목 | Before | After |
|------|--------|-------|
| API route 라인 수 | 116줄 | 69줄 |
| 서비스 파일 | 0개 | 2개 |
| 비즈니스 로직 위치 | route.ts | 서비스 레이어 |
| 에러 표시 방식 | URL에 노출 | toast + URL 정리 |

---

## 2026-01-31: ProfileService Upsert 방식 적용

### 파일
- `src/services/profileService.ts` (수정)
- `src/app/api/auth/callback/route.ts` (수정)

### 변경 사유
- `exists()` + `create()` 분리로 인한 2번의 DB 요청
- Race condition 발생 가능성
- 코드 복잡도

### 변경 내용

#### 1. 함수 병합: `exists()` + `create()` → `ensureProfile()`

**Before:**
```typescript
const hasProfile = await profileService.exists(supabase, user.id);
if (!hasProfile) {
  const { success } = await profileService.create(supabase, user, kakaoData);
}
```

**After:**
```typescript
const { success } = await profileService.ensureProfile(supabase, user, kakaoData);
```

#### 2. Upsert 적용

```typescript
async ensureProfile(client, user, kakaoData) {
  const { error } = await client.from("profiles").upsert(
    { id: user.id, ... },
    { onConflict: "id", ignoreDuplicates: true }
  );
  return { success: !error };
}
```

### Before/After 비교

| 항목 | Before | After |
|------|--------|-------|
| DB 요청 횟수 | 2회 (exists + create) | 1회 (upsert) |
| Race condition | 발생 가능 | 방지됨 |
| 함수 개수 | 2개 | 1개 |
| API route 라인 수 | 69줄 | 65줄 |

---

## 2026-01-31: Auth Callback 네이밍 컨벤션 개선

### 파일
- `src/app/api/auth/callback/route.ts` (수정)

### 변경 사유
- 변수명이 모호하거나 불필요하게 긴 경우 존재
- 일관성 부족

### 변경 내용

| Before | After | 이유 |
|--------|-------|------|
| `sessionData` | `authData` | 인증 결과임을 명확히 |
| `exchangeError` | `authError` | 일관성 |
| `currentSessionData` | `session` | "current" 불필요, 간결함 |
| `fallbackKakaoData` | `defaultKakaoData` | 의미 명확화 |

---

## 2026-01-31: API 유틸리티 타입 안전성 강화

### 파일
- `src/utils/api.ts` (수정)
- `src/app/api/auth/callback/route.ts` (수정)

### 변경 사유
- `utils/api.ts`의 함수들이 `types/api.ts`의 타입을 사용하지 않음
- `createErrorRedirect`가 route 파일에 인라인으로 정의되어 있음

### 변경 내용

#### 1. 타입 적용
```typescript
// Before
export function createErrorResponse(...) { ... }
export function createSuccessResponse<T>(...) { ... }

// After
import { ApiResponse, ApiErrorResponse } from "@/types/api";

export function createErrorResponse(...): NextResponse<ApiErrorResponse> { ... }
export function createSuccessResponse<T>(...): NextResponse<ApiResponse<T>> { ... }
```

#### 2. createErrorRedirect 추가
```typescript
export function createErrorRedirect(
  baseUrl: string,
  errorCode: string
): NextResponse {
  const redirectUrl = new URL("/", baseUrl);
  redirectUrl.searchParams.set("error", errorCode);
  return NextResponse.redirect(redirectUrl);
}
```

#### 3. callback/route.ts에서 import
```typescript
import { createErrorRedirect } from "@/utils/api";
```

### Before/After 비교

| 항목 | Before | After |
|------|--------|-------|
| 타입 안전성 | 없음 | 반환 타입 명시 |
| createErrorRedirect 위치 | route.ts 인라인 | utils/api.ts |
| 재사용성 | 불가 | 가능 |

---

## 2026-01-31: mapKakaoAgeRange를 mappers.ts로 이동

### 파일
- `src/utils/mappers.ts` (수정)
- `src/services/kakaoService.ts` (수정)
- `src/services/profileService.ts` (수정)

### 변경 사유
- `kakaoService.mapAgeRange`가 하드코딩된 문자열 반환
- `AGE_RANGE` 상수를 사용하지 않음
- `GENDER.UNKNOWN`을 age 기본값으로 사용 (의미 불일치)
- 기존 `mappers.ts`에 관련 매퍼들이 이미 존재

### 변경 내용

#### 1. mappers.ts에 mapKakaoAgeRange 추가
```typescript
import { AGE_RANGE } from "@/types/enums";

export const mapKakaoAgeRange = (
  ageRange: string | undefined
): (typeof AGE_RANGE)[keyof typeof AGE_RANGE] => {
  if (!ageRange) return AGE_RANGE.UNKNOWN;
  const startAge = parseInt(ageRange.split("~")[0], 10);
  if (startAge >= 60) return AGE_RANGE[60];
  if (startAge >= 50) return AGE_RANGE[50];
  if (startAge >= 40) return AGE_RANGE[40];
  if (startAge >= 30) return AGE_RANGE[30];
  if (startAge >= 20) return AGE_RANGE[20];
  return AGE_RANGE[10];
};
```

#### 2. kakaoService에서 mapAgeRange 제거

#### 3. profileService에서 import 변경
```typescript
// Before
import { kakaoService } from "./kakaoService";
age_group: kakaoService.mapAgeRange(kakaoData.ageRange),

// After
import { mapKakaoAgeRange } from "@/utils/mappers";
age_group: mapKakaoAgeRange(kakaoData.ageRange),
```

### Before/After 비교

| 항목 | Before | After |
|------|--------|-------|
| 위치 | kakaoService | utils/mappers |
| 상수 사용 | 하드코딩 | AGE_RANGE 상수 |
| 타입 안전성 | string | typeof AGE_RANGE 값 |
| 기본값 | GENDER.UNKNOWN | AGE_RANGE.UNKNOWN |

---
