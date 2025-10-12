import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
  QueryKey,
  QueryFunction,
} from "@tanstack/react-query";
import { useApiError } from "./useApiError";
import { ApiError } from "@/lib/fetcher";

/**
 * useQuery를 래핑하여 공통 에러 처리를 추가한 커스텀 훅입니다.
 * queryFn 실행 중 에러가 발생하면 handleApiError를 호출합니다.
 * @param options - useQuery의 options 객체
 */
export const useApiQuery = <
  TQueryFnData = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  options: UseQueryOptions<TQueryFnData, ApiError, TData, TQueryKey>
): UseQueryResult<TData, ApiError> => {
  const { handleApiError } = useApiError();
  const { queryFn, ...restOptions } = options;
  const wrappedQueryFn: QueryFunction<TQueryFnData, TQueryKey> = async (
    context
  ) => {
    try {
      // queryFn이 함수가 아닐 경우를 대비한 타입 가드 추가
      if (typeof queryFn !== "function") {
        throw new Error("queryFn must be a function");
      }
      return await queryFn(context);
    } catch (error) {
      handleApiError(error);
      throw error; // 에러를 다시 throw하여 React Query가 error 상태를 인지하도록 함
    }
  };

  return useQuery({
    ...restOptions,
    queryFn: wrappedQueryFn,
  });
};
