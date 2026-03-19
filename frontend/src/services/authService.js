import axios from 'axios';
import axiosClient from '../configurations/axiosClient';
import { setToken, setRefreshToken, setUser } from './localStorageService';

// Định nghĩa các endpoint (đường dẫn API) để dễ quản lý và dễ đọc hơn
const API = {
  LOGIN: '/auth/login',
  REFRESH_TOKEN: 'http://localhost:3000/auth/refresh-token',
  CHANGE_PASSWORD: '/auth/change-password',
  FORGOT_PASSWORD: '/auth/forgot-password'
};

export const forgotPassword = async (email) => {
  const response = await axiosClient.post(API.FORGOT_PASSWORD, { email });
  return response;
};

export const changePassword = async (email, oldPassword, newPassword) => {
  const response = await axiosClient.post(API.CHANGE_PASSWORD, {
    email: email,
    oldPassword: oldPassword,
    newPassword: newPassword,
  });
  return response;
};

export const logIn = async (email, password) => {

  const response = await axiosClient.post(API.LOGIN, {
    email: email,
    password: password,
  });

  // Lưu các thông tin trả về 
  // (dựa vào cấu hình axiosClient thì response hiện đã là response.data)
  if (response.success) {
    setToken(response.accessToken);
    setRefreshToken(response.refreshToken);
    setUser(response.user);
  }

  return response;
};

export const refreshToken = async (tokenValue) => {
  // Gửi bằng axios thuần thay vì axiosClient để không mắc lỗi lặp vô tận (circular dependencies) với interceptor 401
  return await axios.post(API.REFRESH_TOKEN, {
    refreshToken: tokenValue
  });
};
