import { apiClient } from "../api";

export const dashboardApi = {
  getStats:          ()            => apiClient.get("/dashboard/stats"),
  getMonthlyRevenue: (year)        => apiClient.get(`/dashboard/revenue/monthly?year=${year || ""}`),
  getDailyRevenue:   (year, month) => apiClient.get(`/dashboard/revenue/daily?year=${year || ""}&month=${month || ""}`),
  getTopProducts:    (limit = 10)  => apiClient.get(`/dashboard/top-products?limit=${limit}`),
  getPaymentAnalysis: ()           => apiClient.get("/dashboard/payment-analysis"),
  getOrderStatusDist: ()           => apiClient.get("/dashboard/order-status-dist"),
};
