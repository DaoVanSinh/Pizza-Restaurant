import useSWR from "swr";
import { apiClient } from "../services/api";

const fetcher = (url) => apiClient.get(url).then((r) => r.data);

export const useCategories = () => {
  const { data, error, isLoading } = useSWR("/v1/categories", fetcher);
  return {
    categories: data || [],
    isLoading,
    isError: !!error,
  };
};
