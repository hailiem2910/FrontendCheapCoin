import { axiosInstance } from './tokenService';
const BASE_API_URL = process.env.REACT_APP_API_URL ;

// Add item to cart
const addToCart = async (cartData) => {
  try {
    const response = await axiosInstance.post(`${BASE_API_URL}/api/v1/cart/add`, {
      seriesId: cartData.seriesId,
      quantity: cartData.quantity,
      type: cartData.type
    });
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

// Get cart items
const getCartItems = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_API_URL}/api/v1/cart`);
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

// Update cart item quantity
const updateCartItem = async (seriesId, quantity) => {
  try {
    const response = await axiosInstance.put(`${BASE_API_URL}/api/v1/cart/update`, {
      seriesId,
      quantity
    });
    return response.data;
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

// Remove item from cart
const removeCartItem = async (seriesId, type) => {
  try {
    // Update API endpoint to include type parameter (changed from size)
    const response = await axiosInstance.delete(`${BASE_API_URL}/api/v1/cart/remove/${seriesId}`, {
      data: { type }
    });
    return response.data;
  } catch (error) {
    console.error('Error removing cart item:', error);
    throw error;
  }
};

// Remove all items from cart
const removeAllCartItems = async () => {
  try {
    const response = await axiosInstance.delete(`${BASE_API_URL}/api/v1/cart/removeAll`);
    return response.data;
  } catch (error) {
    console.error('Error removing all cart items:', error);
    throw error;
  }
};

export { addToCart, getCartItems, updateCartItem, removeCartItem, removeAllCartItems };