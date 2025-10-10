import { NextResponse } from "next/server";

export function createErrorResponse(
  code: string,
  status: number,
  message: string
) {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
    },
    { status }
  );
}

export function createSuccessResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}
