import { apiClient } from "../api";

export const promotionApi = {
  getPromotions: () => apiClient.get("/promotions"),
  addPromotion: (data) => apiClient.post("/promotions/add", data),
  deletePromotion: (id) => apiClient.delete(`/promotions/${id}`),
};
