import { apiClient } from "../api";

export const categoryApi = {
  getAll: () => apiClient.get("/v1/categories"),
  create: (formData) => apiClient.post("/v1/categories", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  update: (id, formData) => apiClient.put(`/v1/categories/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  delete: (id) => apiClient.delete(`/v1/categories/${id}`),
};
