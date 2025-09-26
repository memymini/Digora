import { ApiResponse } from "./types";

export async function fetcher<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  const result: ApiResponse<T> = await res.json();

  // HTTP 요청이 실패했거나, API가 에러를 반환한 경우
  if (!res.ok || !result.success) {
    // result가 success:false를 포함하는 ApiErrorResponse 형태일 경우, 서버가 보낸 에러 메시지를 사용
    const errorMessage = result.success === false
      ? result.error.message
      // 그렇지 않은 경우(네트워크 에러 등), HTTP 상태 기반의 기본 에러 메시지 생성
      : `Request failed with status: ${res.status}`;

    throw new Error(errorMessage);
  }

  // 성공한 경우, 실제 데이터인 result.data를 반환
  return result.data;
}
