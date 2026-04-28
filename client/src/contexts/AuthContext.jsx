import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/modules/auth.api';
import { userApi } from '../services/modules/user.api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        let userData = JSON.parse(storedUser);
        setIsAuthenticated(true);
        try {
          // Lấy profile mới nhất
          const profileRes = await userApi.getUserProfile();
          const profileData = profileRes.data;
          userData = {
            ...userData,
            fullName: profileData.fullName || userData.fullName,
            address: profileData.address || userData.address,
            avatarUrl: profileData.avatar || profileData.avatarUrl || userData.avatarUrl,
            phone: profileData.user?.phone || userData.phone,
          };
          localStorage.setItem('user', JSON.stringify(userData));
        } catch {
          // Lỗi sync profile ở background — giữ nguyên dữ liệu cũ
        }
        setUser(userData);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (username, password) => {
    const res = await authApi.login({ identifier: username, password });
    if (res.data && res.data.data) {
      const { token, refreshToken, ...baseUserData } = res.data.data;
      localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

      let userData = { ...baseUserData };
      try {
        // Đồng bộ dữ liệu Profile ngay sau khi login
        const profileRes = await userApi.getUserProfile();
        const profileData = profileRes.data;
        userData = {
           ...userData,
           fullName: profileData.fullName,
           address: profileData.address,
           avatarUrl: profileData.avatar || profileData.avatarUrl,
           phone: profileData.user?.phone || userData.phone,
        };
      } catch {
        // Sync profile thất bại — dùng dữ liệu từ login response
      }

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    }
    throw new Error('Đăng nhập thất bại. Vui lòng thử lại.');
  };

  const logout = async () => {
    try {
      // Gọi backend để xóa refreshToken khỏi DB
      await authApi.logout();
    } catch {
      // Dù server có lỗi vẫn xóa local storage
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (newData) => {
    setUser(prev => {
      const updated = { ...prev, ...newData };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

