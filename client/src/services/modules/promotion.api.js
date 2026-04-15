import { apiClient } from "../api";

export const promotionApi = {
    checkPromotion: (code) => apiClient.get(`/client/promotions/check?code=${code}`),
};
