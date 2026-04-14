import { apiClient } from '../api';

export const userApi = {
  getUserProfile: () => apiClient.get('/client/profile'),
  updateProfile: (data) => apiClient.put('/client/profile', data),
  uploadAvatar: (formData) => apiClient.post('/client/profile/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};
