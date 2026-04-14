import { apiClient } from "../api";

export const categoryApi = {
  getAll: () => apiClient.get("/v1/categories"),
};
