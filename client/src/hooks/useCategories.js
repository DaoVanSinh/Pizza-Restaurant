import useSWR from 'swr';
import { apiClient } from '../services/api';

const fetcher = (url) => apiClient.get(url).then(r => r.data);

/**
 * Lấy danh sách categories từ Backend.
 * Trả về: [{ id, slug, name, imageKey }]
 */
export const useCategories = () => {
  const { data, error, isLoading } = useSWR('/categories', fetcher);
  return {
    categories: data || [],
    isLoading,
    isError: !!error,
  };
};
