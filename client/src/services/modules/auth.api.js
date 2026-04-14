import { apiClient } from "../api";

export const authApi = {
  login: (data) => apiClient.post("/auth/login", data),
  register: (data) => apiClient.post("/auth/register", data),
  forgotPassword: (data) => apiClient.post("/auth/forgot-password", data),
  resetPassword: (data) => apiClient.post("/auth/reset-password", data),
  refreshToken: (data) => apiClient.post("/auth/refresh-token", data),
};
