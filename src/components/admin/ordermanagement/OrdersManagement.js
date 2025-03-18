import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrdersManagement.css';
import { getOrders, updateOrderStatus } from '../../../services/orderService';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ordersPerPage = 5;
  const isUpdatingStatus = useRef(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders();
      setOrders(response.orders);

      if (!isUpdatingStatus.current) {
        applyFilters(response.orders);
      }

      setLoading(false);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách đơn hàng:', err);
      setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const applyFilters = (orders) => {
    let filtered = orders;
    if (selectedMonth !== 'all') {
      const month = parseInt(selectedMonth);
      filtered = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() + 1 === month;
      });
    }
    setFilteredOrders(filtered);
    const newTotalPages = Math.ceil(filtered.length / ordersPerPage);
    setTotalPages(newTotalPages > 0 ? newTotalPages : 1);
  };

  useEffect(() => {
    if (!isUpdatingStatus.current) {
      applyFilters(orders);
      setCurrentPage(1);
    }
  }, [selectedMonth, orders]);

  const getCurrentOrders = () => {
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      isUpdatingStatus.current = true;

      await updateOrderStatus(orderId, newStatus);

      const updatedOrders = orders.map(order =>
        order._id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);

      applyFilters(updatedOrders);

      isUpdatingStatus.current = false;
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái đơn hàng:', err);
      setError('Không thể cập nhật trạng thái. Vui lòng thử lại.');
      isUpdatingStatus.current = false;
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewOrderDetail = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          className={`order-manage-pagination-button ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    return (
      <div className="order-manage-pagination">
        {pages}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const months = [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' }
  ];

  const getCurrentMonth = () => {
    if (selectedMonth === 'all') return 'Tất cả các tháng';
    return months.find(m => m.value === parseInt(selectedMonth))?.label || 'Tất cả các tháng';
  };

  if (loading) return <div className="order-manage-loading">Đang tải danh sách đơn hàng...</div>;
  if (error) return <div className="order-manage-error">{error}</div>;

  return (
    <div className="order-manage-container">
      <div className="order-manage-content">
        <h1 className="order-manage-title">Quản lý đơn hàng</h1>
        <div className="order-manage-controls">
          <div className="order-manage-filter">
            <label htmlFor="month-filter">Lọc theo tháng:</label>
            <select
              id="month-filter"
              className="order-manage-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="all">Tất cả</option>
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="order-manage-table-container">
          {renderPagination()}
          <table className="order-manage-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên khách hàng</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Địa chỉ</th>
                <th>Ngày đặt hàng</th>
                <th>Trạng thái</th>
                <th colSpan="2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {getCurrentOrders().map(order => (
                <tr key={order._id} className="order-manage-row">
                  <td>#{order.orderCode}</td>
                  <td>{order.shippingAddress.fullName}</td>
                  <td>{order.userId.email}</td>
                  <td>{order.shippingAddress.phone}</td>
                  <td>{order.shippingAddress.address}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td className={`order-manage-status order-status-${order.status}`}>
                    {order.status === 'pending' && 'Đang xử lý'}
                    {order.status === 'done' && 'Hoàn thành'}
                    {order.status === 'cancelled' && 'Đã hủy'}
                    {order.status === 'payment_fail' && 'Thanh toán thất bại'}
                  </td>
                  <td>
                    <select
                      className="order-manage-action-select"
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          handleStatusChange(order._id, e.target.value);
                          e.target.value = "";
                        }
                      }}
                    >
                      <option value="">Cập nhật</option>
                      <option value="pending">Đang xử lý</option>
                      <option value="done">Hoàn thành</option>
                      <option value="cancelled">Hủy đơn</option>
                    </select>
                  </td>
                  <td>
                    <button 
                      className="order-manage-detail-button"
                      onClick={() => handleViewOrderDetail(order._id)}
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="order-manage-summary">
          <div className="order-manage-month">
            <span>Tháng:</span> {getCurrentMonth()}
          </div>
          <div className="order-manage-total">
            <span>Tổng số đơn hàng:</span> {filteredOrders.length} đơn
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersManagement;