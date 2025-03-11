import axios from 'axios';

const BASE_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const AUTH_API_URL = `${BASE_API_URL}/api/v1/auth`;

// Tạo axios instance với interceptor
const axiosInstance = axios.create({
  baseURL: BASE_API_URL
});



// Interceptor để tự động refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Nếu lỗi 401 (Unauthorized) và chưa thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        // Gọi API refresh token
        const response = await axios.post(`${AUTH_API_URL}/refreshToken`, {
          refreshToken
        });
        
        // Lưu tokens mới
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        
        // Cập nhật header cho request ban đầu
        originalRequest.headers['Authorization'] = `Bearer ${response.data.accessToken}`;
        
        // Thực hiện lại request ban đầu
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Nếu refresh token cũng hết hạn, logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Hàm thiết lập token cho mọi request
const setAuthHeader = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};

// Phương thức logout
const logout = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await axios.post(`${AUTH_API_URL}/logout`, { refreshToken });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};

// Kiểm tra trạng thái đăng nhập
const isAuthenticated = () => {
  return localStorage.getItem('accessToken') !== null;
};

export { axiosInstance, setAuthHeader, logout, isAuthenticated };