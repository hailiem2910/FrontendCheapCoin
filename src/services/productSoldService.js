import { axiosInstance } from './tokenService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const PRODUCT_SOLD_API_URL = `${API_URL}/product-sold`;

// Get all sold products
export const getSoldProducts = async () => {
  try {
    const response = await axiosInstance.get(`${PRODUCT_SOLD_API_URL}/admin/sold-products`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sold products:', error);
    throw error;
  }
};

// Get sold products analytics
export const getSoldProductsAnalytics = async () => {
  try {
    const response = await axiosInstance.get(`${PRODUCT_SOLD_API_URL}/admin/sold-analytics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sold products analytics:', error);
    throw error;
  }
};