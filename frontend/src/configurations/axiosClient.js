import axios from 'axios';
import { 
    getToken, 
    getRefreshToken, 
    setToken, 
    setRefreshToken, 
    clearAuthData 
} from '../services/localStorageService';

const axiosClient = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = []; // Reset queue
};

axiosClient.interceptors.request.use(
  (config) => {
    const token = getToken(); // lấy token an toàn qua service
    
    if (token) {
      // Gắn Bearer Token
      config.headers['Authorization'] = `Bearer ${token}`; 
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Interceptor Response: Xử lý trước kết quả API & Lỗi 401 làm mới token
axiosClient.interceptors.response.use(
  (response) => {
    // Luôn trả về thẳng response.data cho code ở component/service gọn gàng hơn
    if (response && response.data !== undefined) {
      return response.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axiosClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      // Đánh dấu đây là request đang trigger quá trình refresh
      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      // Kịch bản 2: User không còn cả refresh_token (đã logout, rác browser,..) thì kick thẳng ra ngoài auth/login
      if (!refreshToken) {
         clearAuthData();
         // Dispatch event để App component biết user đã logout
         window.dispatchEvent(new Event('auth-logout'));
         return Promise.reject(error);
      }

      try {
        // Import động động authService bên trong interceptor để tránh lỗi Circular Dependency
        // vì trong authService.js có thể có các api cần import axiosClient. 
        const { refreshToken: apiRefreshToken } = await import('../services/authService');
        const refreshResponse = await apiRefreshToken(refreshToken);
        
        // Cần xem backend bạn trả data dạng gì, ví dụ giả sử nó tương tự login: 
        // { success: true, accessToken, refreshToken } - Nếu không có newRefreshToken thì dùng lại cái cũ
        const currentData = refreshResponse.data;
        const newAccessToken = currentData.accessToken;
        const newRefreshToken = currentData.refreshToken || refreshToken;

        // Lưu Token mới vào localStorage
        setToken(newAccessToken);
        setRefreshToken(newRefreshToken);

        // Gắn Access Token mới cho header Request đang lỗi và chạy ngay cái vừa lỗi lại
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        // Chạy queue (thả toàn bộ các Request chờ 1 lượt bằng token mới)
        processQueue(null, newAccessToken);

        // Ném trả kết quả gốc (Đã được Authorization mới)
        return axiosClient(originalRequest);

      } catch (refreshError) {
        // Refresh API hỏng, token expired -> Giải phóng Queue về trạng thái lỗi
        processQueue(refreshError, null);
        
        // Ngắt phiên làm việc -> Văng về Login
        clearAuthData();
        // Dispatch event để App component biết user đã logout
        window.dispatchEvent(new Event('auth-logout'));
        
        return Promise.reject(refreshError);
      } finally {
        // Trả lại cờ trạng thái
        isRefreshing = false;
      }
    }

    // Các lỗi khác như 404, 500, 400 thì thả lại để catch(...) ngoài UI bắt đầu xử lý
    return Promise.reject(error);
  }
);

export default axiosClient;
