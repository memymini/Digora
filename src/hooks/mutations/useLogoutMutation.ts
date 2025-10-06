import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { useApiMutation } from "@/hooks/useApiMutation";
import { http } from "@/lib/fetcher";

const logout = async () => {
  return http.post<null>("/api/auth/logout", null);
};

export const useLogoutMutation = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useApiMutation(logout, {
    onSuccess: () => {
      window.location.assign("/");
    },
  });
};
