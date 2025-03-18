import axios from 'axios';

const BASE_API_URL = process.env.REACT_APP_API_URL ;
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
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${AUTH_API_URL}/refreshToken`, { refreshToken });
        
        // Cập nhật access token mới vào localStorage và header
        localStorage.setItem('accessToken', response.data.accessToken);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${response.data.accessToken}`; // ⚠️ Quan trọng: Cập nhật header cho request gốc
        
        return axiosInstance(originalRequest); // Gửi lại request gốc với token mới
      } catch (refreshError) {
        // Xử lý khi refresh token hết hạn
        logout();
        window.location.href = '/login';
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