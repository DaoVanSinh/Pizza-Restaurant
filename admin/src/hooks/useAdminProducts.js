import useSWR from 'swr';
import { productApi } from '../services/modules/product.api';

// Fetcher xử lý lấy từ API
const fetcher = (category) => productApi.getAllProducts(category).then(res => res.data || []);

export const useAdminProducts = (category = '') => {
  const { data, error, isLoading, mutate } = useSWR(category ? `/admin/products?category=${category}` : '/admin/products', () => fetcher(category));

  return {
    products: data || [],
    isLoading,
    isError: error,
    mutate
  };
};
