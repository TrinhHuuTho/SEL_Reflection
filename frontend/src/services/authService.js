import axios from 'axios';
import axiosClient from '../configurations/axiosClient';
import { setToken, setRefreshToken, setUser } from './localStorageService';
import { getUserInfo } from './userService';

// Định nghĩa các endpoint (đường dẫn API) để dễ quản lý và dễ đọc hơn
const API = {
  LOGIN: '/auth/login',
  REFRESH_TOKEN: 'http://localhost:3000/auth/refresh-token',
  CHANGE_PASSWORD: '/auth/change-password',
  FORGOT_PASSWORD: '/auth/forgot-password',
  REGISTER_STUDENT: '/auth/register-student',
  REGISTER_TEACHER: '/auth/register-teacher'
};

export const registerStudent = async (full_name, email, role = 'student', centerId = null) => {
  const response = await axiosClient.post(API.REGISTER_STUDENT, { full_name, email, role, centerId });
  return response;
};

export const registerTeacher = async (full_name, email, role = 'teacher', centerId = null) => {
  const response = await axiosClient.post(API.REGISTER_TEACHER, { full_name, email, role, centerId });
  return response;
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
    
    // Fetch full user info từ server (bao gồm avatar) và save lại
    try {
      const userInfo = await getUserInfo();
      if (userInfo.success && userInfo.data) {
        setUser(userInfo.data);
      }
    } catch (error) {
      console.error('Error fetching full user info:', error);
      // Continue anyway, use basic user data from login response
    }
  }

  return response;
};

export const refreshToken = async (tokenValue) => {
  // Gửi bằng axios thuần thay vì axiosClient để không mắc lỗi lặp vô tận (circular dependencies) với interceptor 401
  return await axios.post(API.REFRESH_TOKEN, {
    refreshToken: tokenValue
  });
};
