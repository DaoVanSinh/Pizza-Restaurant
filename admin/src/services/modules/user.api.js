import { apiClient } from "../api";

export const userApi = {
  getUserById: (id) => apiClient.get(`/v1/admin/users/${id}`),
  getAllUsers: () => apiClient.get("/v1/admin/users"),
  registerUser: (data) => apiClient.post("/v1/admin/users/register", data),
  deleteUser: (id) => apiClient.delete(`/v1/admin/users/${id}`),
  uploadAvatar: (formData) => apiClient.post("/v1/client/profile/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  getProfile: () => apiClient.get("/v1/client/profile"),
  updateProfile: (data) => apiClient.put("/v1/client/profile", data),
};
