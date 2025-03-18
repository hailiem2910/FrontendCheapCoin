import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderDetail, updateOrderStatus } from '../../../services/orderService';
import './OrderDetail.css';

const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await getOrderDetail(orderId);
      setOrder(response.order);
      setLoading(false);
    } catch (err) {
      console.error('Lỗi khi lấy chi tiết đơn hàng:', err);
      setError('Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setStatusUpdating(true);
      await updateOrderStatus(orderId, newStatus);
      
      // Cập nhật trạng thái đơn hàng trong state
      setOrder(prevOrder => ({
        ...prevOrder,
        status: newStatus,
        shippingStatus: newStatus === 'done' ? 'delivered' : 
                        newStatus === 'cancelled' ? 'cancelled' : 
                        prevOrder.shippingStatus
      }));
      
      setStatusUpdating(false);
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái đơn hàng:', err);
      setError('Không thể cập nhật trạng thái. Vui lòng thử lại.');
      setStatusUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Đang xử lý';
      case 'done': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      case 'payment_fail': return 'Thanh toán thất bại';
      default: return status;
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'cash': return 'Tiền mặt';
      case 'bank': return 'Chuyển khoản';
      case 'online': return 'Thanh toán online';
      default: return method;
    }
  };

  const getShippingStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Chưa giao hàng';
      case 'shipping': return 'Đang giao hàng';
      case 'delivered': return 'Đã giao hàng';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getPaymentStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Chưa thanh toán';
      case 'paid': return 'Đã thanh toán';
      case 'refunded': return 'Đã hoàn tiền';
      default: return status;
    }
  };

  if (loading) return <div className="order-detail-loading">Đang tải thông tin đơn hàng...</div>;
  if (error) return <div className="order-detail-error">{error}</div>;
  if (!order) return <div className="order-detail-error">Không tìm thấy thông tin đơn hàng</div>;

  return (
    <div className="order-detail-container">
      <div className="order-detail-content">
        <div className="order-detail-header">
          <button 
            className="order-detail-back-button" 
            onClick={() => navigate(-1)}
          >
            &larr; Quay lại
          </button>
          <h1 className="order-detail-title">Chi tiết đơn hàng #{order.orderCode}</h1>
        </div>

        <div className="order-detail-sections">
          <div className="order-detail-section">
            <h2 className="order-detail-section-title">Thông tin đơn hàng</h2>
            <div className="order-detail-info-grid">
              <div className="order-detail-info-item">
                <span className="order-detail-label">Mã đơn hàng:</span>
                <span className="order-detail-value">#{order.orderCode}</span>
              </div>
              <div className="order-detail-info-item">
                <span className="order-detail-label">Ngày đặt hàng:</span>
                <span className="order-detail-value">{formatDate(order.createdAt)}</span>
              </div>
              <div className="order-detail-info-item">
                <span className="order-detail-label">Trạng thái:</span>
                <span className={`order-detail-status order-status-${order.status}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <div className="order-detail-info-item">
                <span className="order-detail-label">Phương thức thanh toán:</span>
                <span className="order-detail-value">{getPaymentMethodLabel(order.paymentMethod)}</span>
              </div>
              <div className="order-detail-info-item">
                <span className="order-detail-label">Trạng thái thanh toán:</span>
                <span className={`order-detail-payment-status payment-status-${order.paymentStatus}`}>
                  {getPaymentStatusLabel(order.paymentStatus)}
                </span>
              </div>
              <div className="order-detail-info-item">
                <span className="order-detail-label">Trạng thái giao hàng:</span>
                <span className={`order-detail-shipping-status shipping-status-${order.shippingStatus}`}>
                  {getShippingStatusLabel(order.shippingStatus)}
                </span>
              </div>
            </div>
          </div>

          <div className="order-detail-section">
            <h2 className="order-detail-section-title">Thông tin khách hàng</h2>
            <div className="order-detail-info-grid">
              <div className="order-detail-info-item">
                <span className="order-detail-label">Họ tên:</span>
                <span className="order-detail-value">{order.shippingAddress.fullName}</span>
              </div>
              <div className="order-detail-info-item">
                <span className="order-detail-label">Email:</span>
                <span className="order-detail-value">{order.userId.email}</span>
              </div>
              <div className="order-detail-info-item">
                <span className="order-detail-label">Số điện thoại:</span>
                <span className="order-detail-value">{order.shippingAddress.phone}</span>
              </div>
              <div className="order-detail-info-item">
                <span className="order-detail-label">Địa chỉ:</span>
                <span className="order-detail-value">{order.shippingAddress.address}</span>
              </div>
              {order.shippingAddress.note && (
                <div className="order-detail-info-item">
                  <span className="order-detail-label">Ghi chú:</span>
                  <span className="order-detail-value">{order.shippingAddress.note}</span>
                </div>
              )}
            </div>
          </div>

          <div className="order-detail-section">
            <h2 className="order-detail-section-title">Danh sách sản phẩm</h2>
            <div className="order-detail-products">
              <table className="order-detail-products-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Loại</th>
                    <th>Giá</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems.map((item) => (
                    <tr key={item._id}>
                      <td>{item.productName}</td>
                      <td>{item.type === 'set' ? 'Bộ' : 'Đơn lẻ'}</td>
                      <td>{formatPrice(item.productPrice)} VNĐ</td>
                      <td>{item.quantity}</td>
                      <td>{formatPrice(item.productPrice * item.quantity)} VNĐ</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="4" className="order-detail-total-label">Tổng cộng:</td>
                    <td className="order-detail-total-value">{formatPrice(order.totalPrice)} VNĐ</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="order-detail-section">
            <h2 className="order-detail-section-title">Cập nhật trạng thái</h2>
            <div className="order-detail-actions">
              <div className="order-detail-status-options">
                <button 
                  className={`order-detail-status-button status-pending ${order.status === 'pending' ? 'active' : ''}`}
                  onClick={() => handleStatusChange('pending')}
                  disabled={statusUpdating || order.status === 'pending'}
                >
                  Đang xử lý
                </button>
                <button 
                  className={`order-detail-status-button status-done ${order.status === 'done' ? 'active' : ''}`}
                  onClick={() => handleStatusChange('done')}
                  disabled={statusUpdating || order.status === 'done'}
                >
                  Hoàn thành
                </button>
                <button 
                  className={`order-detail-status-button status-cancelled ${order.status === 'cancelled' ? 'active' : ''}`}
                  onClick={() => handleStatusChange('cancelled')}
                  disabled={statusUpdating || order.status === 'cancelled'}
                >
                  Hủy đơn
                </button>
              </div>
              {statusUpdating && <div className="order-detail-status-updating">Đang cập nhật...</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;