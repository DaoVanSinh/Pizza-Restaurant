import { apiClient } from "../api";

export const productApi = {
  getProductsByCategory: (slug) => apiClient.get(`/client/products/category/${slug}`),
  searchProducts: (query) => apiClient.get(`/client/products/search?name=${encodeURIComponent(query)}`),
  getRaw: (url) => apiClient.get(url)
};
