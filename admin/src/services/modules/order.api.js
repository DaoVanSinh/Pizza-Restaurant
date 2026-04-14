import { apiClient } from "../api";

export const orderApi = {
  getAllOrders: (status) => apiClient.get(status ? `/v1/admin/orders?status=${encodeURIComponent(status)}` : "/v1/admin/orders"),
  updateOrderStatus: (id, status, cancelReason) =>
    apiClient.put(`/v1/admin/orders/${id}/status`, { status, ...(cancelReason ? { cancelReason } : {}) }),
  getStats: () => apiClient.get("/v1/admin/orders/stats"),
  confirmCodPayment: (id) => apiClient.put(`/v1/admin/orders/${id}/confirm-payment`),
};

