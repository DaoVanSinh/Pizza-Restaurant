import { apiClient } from "../api";

export const orderApi = {
  createOrder: (data) => apiClient.post("/client/orders/create", data),
  getMyOrders: () => apiClient.get("/client/orders"),
  getOrderById: (id) => apiClient.get(`/client/orders/${id}`),
  createVNPayUrl: (data) => apiClient.post("/payment/vnpay/create", data),
  verifyVNPayReturn: (query) => apiClient.get(`/payment/vnpay/return?${query}`),
};
