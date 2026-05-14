import { apiClient } from "../api";

export const promotionApi = {
  getPromotions: () => apiClient.get("/v1/admin/promotions"),
  addPromotion: (data) => apiClient.post("/v1/admin/promotions", data),
  updateStatus: (id, status) => apiClient.put(`/v1/admin/promotions/${id}/status`, { status }),
  deletePromotion: (id) => apiClient.delete(`/v1/admin/promotions/${id}`),
};
