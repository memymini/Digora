import { ApiResponse, ApiErrorResponse } from "./types/api";

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, errorResponse: ApiErrorResponse) {
    super(errorResponse.error.message);
    this.status = status;
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

  // res.ok가 아닐 때, ApiErrorResponse 응답
  if (!res.ok) {
    const errorResponse: ApiErrorResponse = await res.json();
    throw new ApiError(res.status, errorResponse);
  }

  // res.ok 이지만, 비즈니스 로직 상 에러일 경우 (success: false)
  const result: ApiErrorResponse | ApiResponse<T> = await res.json();
  if (!result.success) {
    throw new ApiError(res.status, result as ApiErrorResponse);
  }

  return (result as ApiResponse<T>).data;
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
