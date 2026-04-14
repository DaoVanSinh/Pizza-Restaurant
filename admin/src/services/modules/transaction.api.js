import { apiClient } from "../api";

export const transactionApi = {
  getAll: (orderId) =>
    apiClient.get(orderId ? `/v1/admin/transactions?orderId=${orderId}` : "/v1/admin/transactions"),
  getById: (id) => apiClient.get(`/v1/admin/transactions/${id}`),
};
