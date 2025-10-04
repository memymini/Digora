import { toast } from "react-hot-toast";
import { ApiError } from "../lib/fetcher";
import { useLogin } from "@/hooks/useLogin";

/**
 * API 에러를 처리하고, 사용자에게는 상태 코드에 기반한 메시지를 보여줍니다.
 * 상세 에러 정보는 콘솔에 로깅됩니다.
 * @param {unknown} error - 처리할 에러 객체
 */
export function useApiError(error: unknown) {
  if (error instanceof ApiError) {
    // 1. 디버깅을 위해 상세 에러를 콘솔에 로깅합니다.
    console.error("API Error Details:", {
      message: error.message,
      code: error.code,
      status: error.status,
    });

    // 2. 사용자에게는 HTTP 상태 코드에 따라 일관된 메시지를 보여줍니다.
    switch (error.status) {
      case 401:
        useLogin();
        break;
      case 403: // Forbidden
        toast.error("접근 권한이 없습니다.");
        break;
      case 500: // Internal Server Error
        toast.error("서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
        break;
      default:
        break;
    }
  } else if (error instanceof Error) {
    console.error("Generic Error:", error);
  } else {
    console.error("Unknown Error:", error);
    toast.error("알 수 없는 오류가 발생했습니다.");
  }
}
