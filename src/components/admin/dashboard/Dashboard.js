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
    totalProductsSold: 0
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

      // Filter orders for current month
      const currentMonthOrders = ordersResponse.orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === currentMonthNum && 
               orderDate.getFullYear() === currentYear &&
               order.status === 'done'; // Only include completed orders
      });

      // Filter sold products for current month
      const currentMonthProducts = productsResponse.soldProducts.filter(product => {
        const soldDate = new Date(product.createdAt);
        return soldDate.getMonth() === currentMonthNum && 
               soldDate.getFullYear() === currentYear;
      });

      // Calculate monthly stats
      const totalRevenue = currentMonthOrders.reduce((sum, order) => sum + order.totalPrice, 0);
      const totalOrders = currentMonthOrders.length;
      const totalProductsSold = currentMonthProducts.reduce((sum, product) => sum + product.quantity, 0);

      setMonthlyStats({
        totalRevenue,
        totalOrders,
        totalProductsSold
      });

      // Process top products
      // Group products by name and sum quantities
      const productMap = new Map();
      currentMonthProducts.forEach(product => {
        const { productName, quantity, _id } = product;
        if (productMap.has(productName)) {
          const existing = productMap.get(productName);
          productMap.set(productName, {
            ...existing,
            quantity: existing.quantity + quantity
          });
        } else {
          productMap.set(productName, { productName, quantity, _id });
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

  if (loading) return <div className="dashboard-loading">Đang tải dữ liệu bảng điều khiển...</div>;
  if (error) return <div className="dashboard-error">{error}</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1 className="dashboard-title">Dashboard</h1>
        
        <div className="dashboard-section">
          <h2 className="dashboard-section-title">Doanh Thu</h2>
          
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
                  <th>Số lượng đã bán</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr key={product._id}>
                    <td>{index + 1}</td>
                    <td>#{product._id.substring(0, 8)}</td>
                    <td>{product.productName}</td>
                    <td>{product.quantity}</td>
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