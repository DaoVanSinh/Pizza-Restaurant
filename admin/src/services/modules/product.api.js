import { apiClient } from "../api";

export const productApi = {
  getAllProducts: (category) =>
    apiClient.get(category ? `/v1/admin/products?category=${category}` : `/v1/admin/products`),

  getProductById: (id) => apiClient.get(`/v1/admin/products/${id}`),

  // FormData upload — để browser tự set multipart/form-data + boundary
  addProduct: (formData) =>
    apiClient.post("/v1/admin/products", formData),

  editProduct: (id, formData) =>
    apiClient.put(`/v1/admin/products/${id}`, formData),

  deleteProduct: (id) => apiClient.delete(`/v1/admin/products/${id}`),
};
