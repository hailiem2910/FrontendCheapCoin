import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCartItems } from '../../services/cartService';
import { axiosInstance } from '../../services/tokenService';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState({ email: ''});
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    ward: '',
    district: '',
    city: '',
    paymentMethod: 'cash',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // const shippingFee = 30000;

  useEffect(() => {
    fetchCartItems();
    fetchUserInfo();
  }, []);

  const fetchCartItems = async () => {
    try {
      const data = await getCartItems();
      if (data && data.items && data.items.length > 0) {
        setCartItems(data.items);
      } else {
        setError('Your cart is empty. Please add items before checkout.');
      setTimeout(() => navigate('/cart'), 3000);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load cart items');
    }
  };

  const fetchUserInfo = () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      navigate('/login');
      return;
    }
    
    try {
      const decoded = JSON.parse(atob(accessToken.split('.')[1]));
      setUser({ email: decoded.email, fullName: decoded.fullName });
    } catch (error) {
      console.error('Error decoding token:', error);
      navigate('/login');
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear any previous errors when user changes input
  };

  // FIX: Updated subtotal calculation to correctly handle set products
  const subtotal = cartItems.reduce((sum, item) => {
    if (!item.seriesId || typeof item.seriesId.price !== 'number') {
      return sum;
    }
    
    // Check if it's a set type and calculate accordingly
    if (item.type === "set") {
      return sum + (item.seriesId.price * item.seriesId.totalCharacters * item.quantity);
    } else {
      return sum + (item.seriesId.price * item.quantity);
    }
  }, 0);
  
  const total = subtotal ;

  const validateForm = () => {
    if (!formData.phone || !formData.address || !formData.ward || 
        !formData.district || !formData.city) {
      setError('Vui lòng điền đầy đủ thông tin!');
      return false;
    }
    
    // Validate phone number format
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Số điện thoại không hợp lệ!');
      return false;
    }
    
    return true;
  };

  // Modified handleCheckout function in Checkout.js
const handleCheckout = async () => {
  if (!validateForm()) {
    return;
    
  }
  
  if (cartItems.length === 0) {
    setError('Giỏ hàng trống, không thể thanh toán');
    return;
  }
  
  console.log("Bắt đầu thanh toán với các mặt hàng:", cartItems);
  
  setLoading(true);
  setError('');
  
  const orderData = {
    paymentMethod: formData.paymentMethod,
    shippingAddress: {
      fullName: formData.fullName,
      phone: formData.phone,
      address: `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.city}`
    }
  };

  try {
    // Create order first
  const response = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/api/v1/order/create`, orderData);
  console.log("Order creation response:", response.data);
  console.log("Order data being sent:", orderData);
  // Kiểm tra xem response có result không
  if (!response.data || !response.data.result) {
    throw new Error('Order creation failed - no result returned');
  }
  
  // Lấy orderId từ result.userId hoặc result._id
  const orderId = response.data.result._id;
  console.log("Order created successfully with ID:", orderId);
  
  if (formData.paymentMethod === 'cash') {
    alert('Đặt hàng thành công!');
    navigate('/');
  } else {
    // Store orderId for reference
    localStorage.setItem('pendingOrderId', orderId);
    
    // Call API to create payment link for PayOS
    console.log("Creating payment link for order:", orderId);
    
    const paymentResponse = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/api/v1/payment/create-payment-link`, { orderId: orderId });
    
    if (paymentResponse.data && paymentResponse.data.checkoutUrl) {
      // Redirect to PayOS checkout URL
      window.location.href = paymentResponse.data.checkoutUrl;
    } else {
      throw new Error('Không thể tạo liên kết thanh toán');
    }
  }
  } catch (error) {
    console.error('Error during checkout process:', error);
    console.error('Response data:', error.response?.data);
    if (error.response?.data?.message) {
      setError(`Đặt hàng thất bại: ${error.response.data.message}`);
    } else {
      setError('Đặt hàng thất bại! Vui lòng thử lại sau.');
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="checkout-container">
      <h1 className="checkout-title">Check Out</h1>
      
      {error && (
  <div className="alert alert-error">
    {error}
    <button 
      className="alert-close" 
      onClick={() => setError('')}
    >
      ×
    </button>
  </div>
)}
      
      <div className="checkout-content">
        <div className="order-details">
          <h2>Your Order</h2>
          
          {cartItems.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <div className="order-items">
              {cartItems.map(item => {
                if (!item.seriesId) return null;
                
                const series = item.seriesId;
                
                // Determine display quantity based on product type
                const displayQuantity = item.type === "set"
                  ? item.quantity * (series.totalCharacters || 1)
                  : item.quantity;
                  
                // Calculate total price based on product type
                const totalPrice = item.type === "set"
                  ? series.price * (series.totalCharacters || 1) * item.quantity
                  : series.price * item.quantity;

                // Map the type value to display name
                const typeDisplayName = item.type === "set" ? "Full Set" : "Single Box";

                return (
                  <div key={series._id} className="order-item">
                    <img src={series.posterImageURL || "/placeholder.jpg"} alt={series.name} className="item-image" />
                    <span className="item-name">{series.name} ({typeDisplayName})</span>
                    <span className="item-quantity">{displayQuantity}</span>
                    <span className="item-price">{totalPrice.toLocaleString()} VND</span>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="order-checkout-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>{subtotal.toLocaleString()} VND</span>
            </div>
            {/* <div className="summary-row">
              <span>Shipping:</span>
              <span>{shippingFee.toLocaleString()} VND</span>
            </div> */}
            <div className="summary-row total">
              <span>Total:</span>
              <span>{total.toLocaleString()} VND</span>
            </div>
          </div>
        </div>

        <div className="purchase-form">
          <h2>Purchase Information</h2>
          <form onSubmit={(e) => e.preventDefault()}>
            <input type="email" value={user.email} disabled className="form-input" />
            <input 
              type="text"
              name="fullName"
              placeholder='fullName' 
              value={formData.fullName} 
              className="form-input"
              onChange={handleInputChange}
              required
            />
            <input 
              type="tel" 
              name="phone" 
              placeholder="Phone" 
              value={formData.phone}
              className="form-input" 
              onChange={handleInputChange} 
              required
            />
            <input 
              type="text" 
              name="address" 
              placeholder="Address" 
              value={formData.address}
              className="form-input" 
              onChange={handleInputChange} 
              required
            />

            <div className="location-selects">
              <input 
                type="text" 
                name="ward" 
                placeholder="Ward" 
                value={formData.ward}
                className="form-input" 
                onChange={handleInputChange} 
                required
              />
              <input 
                type="text" 
                name="district" 
                placeholder="District" 
                value={formData.district}
                className="form-input" 
                onChange={handleInputChange} 
                required
              />
              <input 
                type="text" 
                name="city" 
                placeholder="City" 
                value={formData.city}
                className="form-input" 
                onChange={handleInputChange} 
                required
              />
            </div>

            <h2>Payment Method</h2>
            <select 
              name="paymentMethod" 
              className="form-select" 
              value={formData.paymentMethod}
              onChange={handleInputChange}
            >
              <option value="cash">Cash</option>
              <option value="payos">PayOS</option>
            </select>

            <button 
              type="button" 
              className="payment-button" 
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Checkout'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;