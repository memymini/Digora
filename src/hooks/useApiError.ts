"use client";
import { toast } from "react-hot-toast";
import { ApiError } from "../lib/fetcher";
import { useRouter } from "next/navigation";

export function useApiError() {
  const router = useRouter();

  const handleApiError = (error: unknown) => {
    if (error instanceof ApiError) {
      console.error("API Error Details:", {
        message: error.message,
        code: error.code,
        status: error.status,
      });

      switch (error.status) {
        case 401:
          router.push("/login");
          break;
        case 403:
          toast.error("접근 권한이 없습니다.");
          break;
        case 429:
          toast.error("투표는 하루에 100회만 가능합니다.");
          break;
        case 500:
          toast.error("서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
          break;
        default:
          toast.error(error.message || "오류가 발생했습니다.");
          break;
      }
    } else if (error instanceof Error) {
      console.error("Generic Error:", error);
      toast.error(error.message || "오류가 발생했습니다.");
    } else {
      console.error("Unknown Error:", error);
      toast.error("알 수 없는 오류가 발생했습니다.");
    }
  };

  return { handleApiError };
}
