import { ApiResponse, ApiErrorResponse } from "./types";

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(errorResponse: ApiErrorResponse) {
    super(errorResponse.error.message);
    this.status = errorResponse.status;
    this.code = errorResponse.error.code;
  }
}

export async function fetcher<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const isFormData = options?.body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options?.headers || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  // res.ok가 아닐 때, 서버는 항상 ApiErrorResponse 형식의 JSON을 보낸다고 가정
  if (!res.ok) {
    const errorResponse: ApiErrorResponse = await res.json();
    throw new ApiError(errorResponse);
  }

  // res.ok 이지만, 비즈니스 로직 상 에러일 경우 (success: false)
  const result: ApiResponse<T> = await res.json();
  if (!result.success) {
    throw new ApiError(result as ApiErrorResponse);
  }

  return result.data;
}

export const http = {
  get: <T>(url: string, options?: RequestInit) =>
    fetcher<T>(url, { ...options, method: "GET" }),

  post: <T>(url: string, body: unknown, options?: RequestInit) => {
    const isFormData = body instanceof FormData;
    return fetcher<T>(url, {
      ...options,
      method: "POST",
      body: isFormData ? body : JSON.stringify(body),
    });
  },

  put: <T>(url: string, body: unknown, options?: RequestInit) => {
    const isFormData = body instanceof FormData;
    return fetcher<T>(url, {
      ...options,
      method: "PUT",
      body: isFormData ? body : JSON.stringify(body),
    });
  },

  delete: <T>(url: string, options?: RequestInit) =>
    fetcher<T>(url, { ...options, method: "DELETE" }),
};
