import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import './Cart.css';
import { useNavigate } from 'react-router-dom';
import { getCartItems, removeCartItem, removeAllCartItems } from '../../services/cartService';

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  
  useEffect(() => {
    fetchCart();
  }, []);
  
  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await getCartItems();
      setCart(data);
      // Initially select all items
      if (data && data.items) {
        setSelectedItems(data.items.map(item => item._id));
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setError('Failed to load cart. Please try again later.');
      setLoading(false);
    }
  };
  
  const handleCheckout = () => {
    navigate('/checkout');
  };
  
  const handleRemoveItem = async (seriesId, type) => {
    try {
      await removeCartItem(seriesId, type);
      fetchCart(); // Refresh cart after removal
    } catch (err) {
      console.error('Failed to remove item:', err);
      setError('Failed to remove item. Please try again.');
    }
  };
  
  const handleRemoveAllItems = async () => {
    try {
      await removeAllCartItems();
      fetchCart(); // Refresh cart after removing all items
    } catch (err) {
      console.error('Failed to remove all items:', err);
      setError('Failed to remove all items. Please try again.');
    }
  };
  
  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };
  
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(cart.items.map(item => item._id));
    } else {
      setSelectedItems([]);
    }
  };
  
  // Calculate subtotal based on selected items
  const calculateSubtotal = () => {
    if (!cart || !cart.items) return 0;
    
    return cart.items
      .filter(item => selectedItems.includes(item._id))
      .reduce((sum, item) => {
        if (item.type === "set") {
          return sum + (item.seriesId.price * item.seriesId.totalCharacters * item.quantity);
        } else {
          return sum + (item.seriesId.price * item.quantity);
        }
      }, 0);
  };
  
  // Check if all items are selected
  const areAllItemsSelected = cart && cart.items && cart.items.length > 0 && 
                             selectedItems.length === cart.items.length;
  
  if (loading) return <div className="loading">Loading cart...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!cart || cart.items.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-content">
          <h1 className="cart-title">My Cart</h1>
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <button className="continue-shopping" onClick={() => navigate('/')}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }
  const shippingFee = 30000;
  const subtotal = calculateSubtotal();
  const total = subtotal + shippingFee;
  return (
    <div className="cart-container">
      <div className="cart-content">
        <h1 className="cart-title">My Cart</h1>
        
        <div className="cart-main">
          <div className="cart-items">
            <div className="cart-header">
              <label className="select-all">
                <input 
                  type="checkbox" 
                  checked={areAllItemsSelected}
                  onChange={handleSelectAll} 
                />
                <span>Select all</span>
              </label>
              <div className="cart-columns">
                <span>Product</span>
                <span>Price</span>
                <span>Quantity</span>
                <span className="total-column">
                  <span>Total</span>
                  {/* {areAllItemsSelected && (
                    <button 
                      className="delete-all-button"
                      onClick={handleRemoveAllItems}
                      title="Remove all items"
                    >
                      <Trash2 size={18} />
                    </button>
                  )} */}
                </span>
                <span></span>
              </div>
            </div>

            {cart.items.map((item) => {
              const series = item.seriesId;
              
              // Calculate display quantity and total based on type selection
              let displayQuantity = item.quantity;
              let totalPrice = series.price * item.quantity;
              
              if (item.type === "set") {
                displayQuantity = item.quantity * series.totalCharacters;
                totalPrice = series.price * series.totalCharacters * item.quantity;
              }
              
              return (
                <div className="cart-item" key={item._id}>
                  <input 
                    type="checkbox" 
                    className="item-checkbox"
                    checked={selectedItems.includes(item._id)}
                    onChange={() => handleSelectItem(item._id)}
                  />
                  <div className="item-image">
                    <img src={series.posterImageURL || "/placeholder.jpg"} alt={series.name} />
                  </div>
                  <div className="item-details">
                    <span className="item-name">{series.name}</span>
                    <span className="item-type">Type: {item.type === "set" ? "Full Set" : "Single Box"}</span>
                  </div>
                  <div className="item-price">{series.price.toLocaleString()} VND</div>
                  <div className="item-quantity">{displayQuantity}</div>
                  <div className="item-total">{totalPrice.toLocaleString()} VND</div>
                  <button 
                    className="delete-button"
                    onClick={() => handleRemoveItem(series._id, item.type)}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal :</span>
              <span>{subtotal.toLocaleString()} VND</span>
            </div>
            <div className="summary-row">
              <span>Shipping :</span>
              <span>{shippingFee.toLocaleString()} VND</span>
            </div>
            <div className="summary-row total">
              <span>Total :</span>
              <span>{total.toLocaleString()} VND</span>
            </div>
            <button 
              className="checkout-button" 
              onClick={handleCheckout}
              disabled={selectedItems.length === 0}
            >
              Check Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;