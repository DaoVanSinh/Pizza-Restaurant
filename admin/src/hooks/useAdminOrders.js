import useSWR from 'swr';
import { orderApi } from '../services/modules/order.api';

// Fetcher tự đọc params
const fetcher = (status) => orderApi.getAllOrders(status).then(res => res.data || []);

export const useAdminOrders = (status = '') => {
  // refreshInterval = 30s auto polling
  const { data, error, isLoading, mutate } = useSWR(
      status ? `/admin/orders?status=${status}` : '/admin/orders', 
      () => fetcher(status),
      { refreshInterval: 30000 }
  );

  return {
    orders: data || [],
    isLoading,
    isError: error,
    mutate
  };
};
