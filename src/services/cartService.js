import { axiosInstance } from './tokenService';

// Add item to cart
const addToCart = async (cartData) => {
  try {
    const response = await axiosInstance.post('http://localhost:5000/api/v1/cart/add', {
      seriesId: cartData.seriesId,
      quantity: cartData.quantity,
      type: cartData.type // Changed from size to type
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
    const response = await axiosInstance.get('http://localhost:5000/api/v1/cart');
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

// Update cart item quantity
const updateCartItem = async (seriesId, quantity) => {
  try {
    const response = await axiosInstance.put('http://localhost:5000/api/v1/cart/update', {
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
    const response = await axiosInstance.delete(`http://localhost:5000/api/v1/cart/remove/${seriesId}`, {
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
    const response = await axiosInstance.delete('http://localhost:5000/api/v1/cart/removeAll');
    return response.data;
  } catch (error) {
    console.error('Error removing all cart items:', error);
    throw error;
  }
};

export { addToCart, getCartItems, updateCartItem, removeCartItem, removeAllCartItems };