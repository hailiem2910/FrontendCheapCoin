import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { getOrders, getOrderAnalytics } from '../../../services/orderService';
import { getSoldProducts} from '../../../services/productSoldService';

const Dashboard = () => {
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
    goalCompletion: 88
  });
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    setCurrentMonth(month);

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersResponse, analyticsResponse, productsResponse] = await Promise.all([
        getOrders(),
        getOrderAnalytics(),
        getSoldProducts()
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
      const goalCompletion = analyticsResponse?.goalCompletion || 88;

      setMonthlyStats({
        totalRevenue,
        totalOrders,
        totalProductsSold,
        revenueChange,
        ordersChange,
        productsChange,
        goalCompletion
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
            popularity: Math.floor(Math.random() * 100) // Mock popularity data
          });
        }
      });

      // Convert to array and sort by quantity
      const topProductsArray = Array.from(productMap.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5); // Get top 5

      setTopProducts(topProductsArray);
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
        <h1 className="dashboard-title">Dashboard</h1>
        
        <div className="dashboard-section">
          <h2 className="dashboard-section-title">
            Doanh Thu
            <div className="goal-progress">
              <div className="progress-circle">
                <svg className="progress-ring" width="80" height="80">
                  <circle 
                    className="progress-ring-bg"
                    cx="40" 
                    cy="40" 
                    r="36"
                  />
                  <circle 
                    className="progress-ring-circle progress-ring-value"
                    cx="40" 
                    cy="40" 
                    r="36"
                    style={{ 
                      strokeDasharray: `${2 * Math.PI * 36}`,
                      strokeDashoffset: `${2 * Math.PI * 36 * (1 - monthlyStats.goalCompletion / 100)}`
                    }}
                  />
                </svg>
                <div className="progress-text">{monthlyStats.goalCompletion}%</div>
              </div>
            </div>
          </h2>
          
          <div className="dashboard-cards">
            <div className="dashboard-card revenue-card">
              <div className="dashboard-card-header">
                <h3>Tháng {currentMonth}</h3>
                <div className="dashboard-card-badge">Doanh thu</div>
              </div>
              <div className="dashboard-card-body">
                <div className="dashboard-card-value">
                  {formatCurrency(monthlyStats.totalRevenue)}
                </div>
                <div className="dashboard-card-subtitle">
                  Tổng doanh thu
                </div>
                {renderTrendIndicator(monthlyStats.revenueChange)}
              </div>
            </div>
            
            <div className="dashboard-card order-card">
              <div className="dashboard-card-header">
                <h3>Tháng {currentMonth}</h3>
                <div className="dashboard-card-badge">Đơn hàng</div>
              </div>
              <div className="dashboard-card-body">
                <div className="dashboard-card-value">
                  {monthlyStats.totalOrders}
                </div>
                <div className="dashboard-card-subtitle">
                  Tổng đơn hàng
                </div>
                {renderTrendIndicator(monthlyStats.ordersChange)}
              </div>
            </div>
            
            <div className="dashboard-card product-card">
              <div className="dashboard-card-header">
                <h3>Tháng {currentMonth}</h3>
                <div className="dashboard-card-badge">Sản phẩm</div>
              </div>
              <div className="dashboard-card-body">
                <div className="dashboard-card-value">
                  {monthlyStats.totalProductsSold}
                </div>
                <div className="dashboard-card-subtitle">
                  Sản phẩm đã bán
                </div>
                {renderTrendIndicator(monthlyStats.productsChange)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="dashboard-section">
          <h2 className="dashboard-section-title">Sản Phẩm Bán Chạy</h2>
          
          <div className="dashboard-table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>ID</th>
                  <th>Tên sản phẩm</th>
                  <th>Độ phổ biến</th>
                  <th>Số lượng đã bán</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr key={product._id}>
                    <td>
                      <div className={`product-rank ${index < 3 ? `rank-${index + 1}` : ''}`}>
                        {index + 1}
                      </div>
                    </td>
                    <td><span className="product-id">#{product._id.substring(0, 8)}</span></td>
                    <td>{product.productName}</td>
                    <td>
                      <div className="product-popularity">
                        <div className={`popularity-bar ${getPopularityClass(product.popularity)}`}>
                          <div 
                            className="popularity-value" 
                            style={{ width: `${product.popularity}%` }}
                          ></div>
                        </div>
                        <span>{product.popularity}%</span>
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
                    <td colSpan="5" className="dashboard-no-data">
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