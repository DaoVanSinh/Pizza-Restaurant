import useSWR from 'swr';
import { apiClient } from '../services/api';

const fetcher = (url) => apiClient.get(url).then(res => res.data);

export const useProfile = () => {
  const { data, error, isLoading, mutate } = useSWR('/client/profile', fetcher, {
    shouldRetryOnError: false, 
    revalidateOnFocus: false
  });

  return {
    profile: data,
    isLoading,
    isError: error,
    mutate
  };
};
