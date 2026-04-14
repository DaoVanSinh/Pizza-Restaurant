import { apiClient } from "../api";

export const variantApi = {
  getAll: () => apiClient.get("/v1/variants"),
};
