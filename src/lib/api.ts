import { NextResponse } from "next/server";
import { ApiErrorResponse } from "@/lib/types";

export function createErrorResponse(
  code: string,
  status: number,
  message: string
) {
  return NextResponse.json<ApiErrorResponse>({
    success: false,
    status,
    error: { code, message },
  });
}
