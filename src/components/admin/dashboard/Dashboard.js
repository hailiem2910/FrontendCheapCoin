import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { getOrders, getOrderAnalytics } from '../../../services/orderService';
import { getSoldProducts } from '../../../services/productSoldService';
import { getRecentUsers } from '../../../services/userService';

const Dashboard = () => {
  const MONTHLY_PRODUCT_TARGET = 100;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState('');
  const [monthlyStats, setMonthlyStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProductsSold: 0,
    revenueChange: 0,
    ordersChange: 0,
    productsChange: 0,
    goalCompletion: 88,
    newCustomers: 0
  });
  const [topProducts, setTopProducts] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    setCurrentMonth(month);

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersResponse, analyticsResponse, productsResponse, usersResponse] = await Promise.all([
        getOrders(),
        getOrderAnalytics(),
        getSoldProducts(),
        getRecentUsers()
      ]);

      // Process orders data
      const now = new Date();
      const currentMonthNum = now.getMonth();
      const currentYear = now.getFullYear();
      const lastMonthNum = currentMonthNum === 0 ? 11 : currentMonthNum - 1;
      const lastMonthYear = currentMonthNum === 0 ? currentYear - 1 : currentYear;

      // Filter orders for current month
      const currentMonthOrders = ordersResponse.orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === currentMonthNum && 
               orderDate.getFullYear() === currentYear &&
               order.status === 'done'; // Only include completed orders
      });

      // Filter orders for last month (for comparison)
      const lastMonthOrders = ordersResponse.orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === lastMonthNum && 
               orderDate.getFullYear() === lastMonthYear &&
               order.status === 'done';
      });

      // Filter sold products for current month
      const currentMonthProducts = productsResponse.soldProducts.filter(product => {
        const soldDate = new Date(product.createdAt);
        return soldDate.getMonth() === currentMonthNum && 
               soldDate.getFullYear() === currentYear;
      });

      // Filter sold products for last month
      const lastMonthProducts = productsResponse.soldProducts.filter(product => {
        const soldDate = new Date(product.createdAt);
        return soldDate.getMonth() === lastMonthNum && 
               soldDate.getFullYear() === lastMonthYear;
      });

      // Calculate current month stats
      const totalRevenue = currentMonthOrders.reduce((sum, order) => sum + order.totalPrice, 0);
      const totalOrders = currentMonthOrders.length;
      const totalProductsSold = currentMonthProducts.reduce((sum, product) => sum + product.quantity, 0);

      // Calculate last month stats
      const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + order.totalPrice, 0);
      const lastMonthTotalOrders = lastMonthOrders.length;
      const lastMonthTotalProducts = lastMonthProducts.reduce((sum, product) => sum + product.quantity, 0);

      // Calculate percentage changes
      const revenueChange = lastMonthRevenue === 0 ? 100 : ((totalRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1);
      const ordersChange = lastMonthTotalOrders === 0 ? 100 : ((totalOrders - lastMonthTotalOrders) / lastMonthTotalOrders * 100).toFixed(1);
      const productsChange = lastMonthTotalProducts === 0 ? 100 : ((totalProductsSold - lastMonthTotalProducts) / lastMonthTotalProducts * 100).toFixed(1);

      // Calculate goal completion (mock data - would be from analytics in real app)
      const goalCompletion = Math.min(Math.round((totalProductsSold / MONTHLY_PRODUCT_TARGET) * 100), 100);

       // Tính toán số lượng khách hàng mới (tất cả khách hàng có role Customer)
       const newCustomersCount = usersResponse.data ? usersResponse.data.length : 0;

      setMonthlyStats({
        totalRevenue,
        totalOrders,
        totalProductsSold,
        revenueChange,
        ordersChange,
        productsChange,
        goalCompletion,
        newCustomers: newCustomersCount
      });

      // Process top products
      // Group products by name and sum quantities
      const productMap = new Map();
      currentMonthProducts.forEach(product => {
        const { productName, quantity, _id, price } = product;
        if (productMap.has(productName)) {
          const existing = productMap.get(productName);
          productMap.set(productName, {
            ...existing,
            quantity: existing.quantity + quantity,
            revenue: existing.revenue + (price * quantity)
          });
        } else {
          productMap.set(productName, { 
            productName, 
            quantity, 
            _id, 
            revenue: price * quantity,
            // Calculate popularity based on product quantity compared to monthly target
            popularity: Math.min(Math.floor((quantity / MONTHLY_PRODUCT_TARGET) * 100), 100)
          });
        }
      });

      // Convert to array and sort by quantity
      const topProductsArray = Array.from(productMap.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5); // Get top 5

      setTopProducts(topProductsArray);
      
      // Set recent users
      setRecentUsers(usersResponse.data ? usersResponse.data.slice(0, 5) : []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes} PM`;
  };

  // Calculate popularity class
  const getPopularityClass = (popularity) => {
    if (popularity >= 70) return 'high-popularity';
    if (popularity >= 30) return 'medium-popularity';
    return 'low-popularity';
  };

  // Calculate quantity class
  const getQuantityClass = (quantity) => {
    if (quantity >= 30) return 'quantity-high';
    if (quantity >= 10) return 'quantity-medium';
    return 'quantity-low';
  };

  // Render trend indicator
  const renderTrendIndicator = (change) => {
    const numChange = parseFloat(change);
    if (numChange > 0) {
      return <div className="trend-indicator trend-up">+{numChange}% từ tháng trước</div>;
    } else if (numChange < 0) {
      return <div className="trend-indicator trend-down">{numChange}% từ tháng trước</div>;
    }
    return <div className="trend-indicator trend-neutral">0% từ tháng trước</div>;
  };

  if (loading) return (
    <div className="dashboard-loading">Đang tải dữ liệu bảng điều khiển...</div>
  );
  
  if (error) return (
    <div className="dashboard-error">{error}</div>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1 className="dashboard-title">Dash Board</h1>
        
        <div className="dashboard-main-content">
          {/* Left section - Revenue stats */}
          <div className="dashboard-section dashboard-left-section">
            <h2 className="dashboard-section-title">Revenue</h2>
            
            <div className="dashboard-sales-card">
              <div className="dashboard-sales-header">
                <div className="dashboard-month-sales">
                  <h3>Month's Sales</h3>
                  <span>Sales Summary</span>
                </div>
                <div className="dashboard-goal-circle">
                  <div className="goal-text">GOALS</div>
                  <svg className="progress-ring" width="80" height="80">
                    <circle 
                      className="progress-ring-bg"
                      cx="40" 
                      cy="40" 
                      r="36"
                      stroke="#EEEEEE"
                      strokeWidth="6"
                      fill="transparent"
                    />
                    <circle 
                      className="progress-ring-circle progress-ring-value"
                      cx="40" 
                      cy="40" 
                      r="36"
                      stroke="#4CAF50"
                      strokeWidth="6"
                      fill="transparent"
                      strokeLinecap="round"
                      style={{ 
                        strokeDasharray: `${2 * Math.PI * 36}`,
                        strokeDashoffset: `${2 * Math.PI * 36 * (1 - monthlyStats.goalCompletion / 100)}`
                      }}
                    />
                  </svg>
                  <span className="goal-percentage">{monthlyStats.goalCompletion}%</span>
                </div>
                <div className="dashboard-month">{currentMonth}</div>
              </div>
              
              <div className="dashboard-sales-grid">
                <div className="dashboard-sales-item">
                  <div className="sales-icon revenue-icon">₫</div>
                  <div className="sales-info">
                    <div className="sales-value">{formatCurrency(monthlyStats.totalRevenue)}</div>
                    <div className="sales-label">Total Sales</div>
                    <div className="sales-change">+{monthlyStats.revenueChange}% from last month</div>
                  </div>
                </div>
                
                <div className="dashboard-sales-item">
                  <div className="sales-icon box-icon">📦</div>
                  <div className="sales-info">
                    <div className="sales-value">{monthlyStats.totalProductsSold}</div>
                    <div className="sales-label">Product Sold</div>
                    <div className="sales-change">+{monthlyStats.productsChange}% from last month</div>
                  </div>
                </div>
                
                <div className="dashboard-sales-item">
                  <div className="sales-icon order-icon">📝</div>
                  <div className="sales-info">
                    <div className="sales-value">{monthlyStats.totalOrders}</div>
                    <div className="sales-label">Total Orders</div>
                    <div className="sales-change">+{monthlyStats.ordersChange}% from last month</div>
                  </div>
                </div>
                
                <div className="dashboard-sales-item">
                  <div className="sales-icon customer-icon">👥</div>
                  <div className="sales-info">
                    <div className="sales-value">{monthlyStats.newCustomers}</div>
                    <div className="sales-label">New Customers</div>
                    <div className="sales-change">+25% from last month</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right section - Recent emails */}
          <div className="dashboard-section dashboard-right-section">
            <h2 className="dashboard-section-title">Recent Mail</h2>
            
            <div className="dashboard-email-list">
              {recentUsers.length > 0 ? (
                recentUsers.map((user, index) => (
                  <div className="dashboard-email-item" key={user._id}>
                    <div className="user-avatar">
                      <div className="avatar-circle">{user.fullName ? user.fullName.charAt(0).toUpperCase() : '?'}</div>
                    </div>
                    <div className="user-email-info">
                      <div className="user-name">{user.email}</div>
                      <div className="email-subject">Meeting Started</div>
                    </div>
                    <div className="email-time">{formatDate(user.createdAt)}</div>
                  </div>
                ))
              ) : (
                <div className="dashboard-no-data">Không có dữ liệu email mới</div>
              )}
            </div>
          </div>
        </div>
        
        <div className="dashboard-section products-section">
          <h2 className="dashboard-section-title">Products</h2>
          
          <div className="dashboard-table-container">
            <div className="top-products-header">
              <h3>Top Products</h3>
            </div>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Popularity</th>
                  <th>Sales</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr key={product._id}>
                    <td className="rank-cell">{index + 1}</td>
                    <td>{product.productName}</td>
                    <td>
                      <div className="product-popularity">
                        <div className={`popularity-bar ${getPopularityClass(product.popularity)}`}>
                          <div 
                            className="popularity-value" 
                            style={{ width: `${product.popularity}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={`product-quantity ${getQuantityClass(product.quantity)}`}>
                        {product.quantity}
                      </div>
                    </td>
                  </tr>
                ))}
                {topProducts.length === 0 && (
                  <tr>
                    <td colSpan="4" className="dashboard-no-data">
                      Không có dữ liệu sản phẩm trong tháng này
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-refresh">
          <button className="dashboard-refresh-button" onClick={fetchDashboardData}>
            Làm mới dữ liệu
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;