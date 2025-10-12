import { AdminVotes } from "@/types";
import { http } from "@/lib/fetcher";
import { useApiQuery } from "../useApiQuery";

export const getAdminVotes = async (): Promise<AdminVotes[]> => {
  return http.get<AdminVotes[]>("/api/admin/votes");
};

export const VOTE_ADMIN_QUERY_KEY = ["admin", "votes"];

export const useAdminVotesQuery = () => {
  return useApiQuery({
    queryKey: VOTE_ADMIN_QUERY_KEY,
    queryFn: getAdminVotes,
  });
};
