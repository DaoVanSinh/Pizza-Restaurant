import { apiClient } from "../api";

export const authApi = {
  login: (data) => apiClient.post("/v1/auth/login", data),
  register: (data) => apiClient.post("/v1/auth/register", data),
  refreshToken: (data) => apiClient.post("/v1/auth/refresh-token", data),
  logout: () => apiClient.post("/v1/auth/logout"),
  forgotPassword: (data) => apiClient.post("/v1/auth/forgot-password", data),
  resetPassword: (data) => apiClient.post("/v1/auth/reset-password", data),
};
