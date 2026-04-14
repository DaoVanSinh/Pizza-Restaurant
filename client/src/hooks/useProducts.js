import useSWR from 'swr';
import { productApi } from '../services/modules/product.api';

const fetcher = (url) => productApi.getRaw(url).then(res => res.data);

export const useProducts = (category = '') => {
  const url = category ? `/client/products?category=${category}` : '/client/products';
  
  const { data, error, isLoading, mutate } = useSWR(url, fetcher);

  return {
    products: data || [],
    isLoading,
    isError: error,
    mutate
  };
};

export const useSearchProducts = (keyword) => {
  const url = keyword ? `/client/products/search?name=${encodeURIComponent(keyword)}` : null;
  const { data, error, isLoading } = useSWR(url, fetcher);

  return {
    products: data || [],
    isLoading,
    isError: error
  };
};
