import useSWR from "swr";
import { apiClient } from "../services/api";

const fetcher = (url) => apiClient.get(url).then((r) => r.data);

export const useVariants = () => {
  const { data, error, isLoading } = useSWR("/v1/variants", fetcher);
  return {
    variants: data || [],
    isLoading,
    isError: !!error,
  };
};
