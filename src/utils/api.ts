import { NextResponse } from "next/server";
import { ApiResponse, ApiErrorResponse } from "@/types/api";

export function createErrorResponse(
  code: string,
  status: number,
  message: string
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
    },
    { status }
  );
}

export function createSuccessResponse<T>(
  data?: T,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

export function createErrorRedirect(
  baseUrl: string,
  errorCode: string
): NextResponse {
  const redirectUrl = new URL("/", baseUrl);
  redirectUrl.searchParams.set("error", errorCode);
  return NextResponse.redirect(redirectUrl);
}
