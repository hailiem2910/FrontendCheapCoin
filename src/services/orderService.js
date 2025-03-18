import { axiosInstance } from './tokenService';

const BASE_API_URL = process.env.REACT_APP_API_URL;
const ORDER_API_URL = `${BASE_API_URL}/api/v1/order`;

// Lấy tất cả đơn hàng (chỉ cho Admin)
export const getOrders = async () => {
  try {
    const response = await axiosInstance.get(`${ORDER_API_URL}/admin/all`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }
};

// Lấy đơn hàng của user hiện tại
export const getUserOrders = async () => {
  try {
    const response = await axiosInstance.get(ORDER_API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

// Lấy chi tiết đơn hàng
export const getOrderDetail = async (orderId) => {
  try {
    const response = await axiosInstance.get(`${ORDER_API_URL}/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};

// Tạo đơn hàng mới
export const createOrder = async (paymentMethod, shippingAddress) => {
  try {
    const response = await axiosInstance.post(`${ORDER_API_URL}/create`, {
      paymentMethod,
      shippingAddress
    });
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Hủy đơn hàng
export const cancelOrder = async (orderId) => {
  try {
    const response = await axiosInstance.put(`${ORDER_API_URL}/${orderId}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

// Cập nhật trạng thái đơn hàng (cho Admin)
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await axiosInstance.put(`${ORDER_API_URL}/admin/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Cập nhật trạng thái giao hàng
export const updateShippingStatus = async (orderId, status) => {
  try {
    const response = await axiosInstance.put(`${ORDER_API_URL}/${orderId}/shipping-status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating shipping status:', error);
    throw error;
  }
};

// Lấy danh sách đơn hàng chưa giao
export const getPendingShipments = async () => {
  try {
    const response = await axiosInstance.get(`${ORDER_API_URL}/pending-shipments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pending shipments:', error);
    throw error;
  }
};

// Lấy thống kê đơn hàng
export const getOrderAnalytics = async () => {
  try {
    const response = await axiosInstance.get(`${ORDER_API_URL}/admin/analytics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order analytics:', error);
    throw error;
  }
};