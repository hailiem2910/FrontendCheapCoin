import { axiosInstance } from "./tokenService";
const BASE_API_URL = process.env.REACT_APP_API_URL;

export const getRecentUsers = async () => {
  try {
    // Don't manually add the token header if axiosInstance already handles it
    const response = await axiosInstance.get(`${BASE_API_URL}/api/v1/admin/dashboard/user`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent users:', error);
    throw error;
  }
};