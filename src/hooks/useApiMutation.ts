"use client";
import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  MutationFunction,
} from "@tanstack/react-query";
import { ApiError } from "@/lib/fetcher";
import { useApiError } from "./useApiError";

/**
 * useMutation을 래핑하여 공통 에러 처리를 추가한 커스텀 훅
 * @param mutationFn - useMutation의 mutationFn
 * @param options - useMutation의 나머지 options
 */
export const useApiMutation = <TData = unknown, TVariables = void>(
  mutationFn: MutationFunction<TData, TVariables>,
  options?: Omit<UseMutationOptions<TData, ApiError, TVariables>, "mutationFn">
): UseMutationResult<TData, ApiError, TVariables> => {
  return useMutation<TData, ApiError, TVariables>({
    mutationFn,
    // 옵션 설정
    ...options,
    // 공통 onError 핸들러
    onError: (error, variables, context) => {
      // 공통 에러처리 함수 호출
      useApiError(error);

      // custom error 처리
      if (options?.onError) {
        // @ts-ignore - 지우지 말것
        options.onError(error, variables, context);
      }
    },
  });
};
