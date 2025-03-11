import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { axiosInstance } from '../../services/tokenService';
import './PayOSQR.css';

const PayOSQR = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const orderCode = queryParams.get('orderCode');
    const paymentStatus = queryParams.get('status');
    
    if (orderCode && paymentStatus) {
      checkPaymentStatus(orderCode, paymentStatus);
    } else {
      setLoading(false);
      setError('Không tìm thấy thông tin thanh toán');
    }
  }, [location]);
  
  const checkPaymentStatus = async (orderCode, paymentStatus) => {
    try {
      // Get payment information from server
      const response = await axiosInstance.get(
        `http://localhost:5000/api/v1/payment/get-payment-link-information?orderCode=${orderCode}`
      );
      
      if (response.data && response.data.data) {
        const paymentInfo = response.data.data;
        setStatus(paymentStatus);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error checking payment status:', err);
      setError('Không thể kiểm tra trạng thái thanh toán');
      setLoading(false);
    }
  };
  
  const handleGoHome = () => {
    navigate('/');
  };
  
  const handleRetry = () => {
    const pendingOrderId = localStorage.getItem('pendingOrderId');
    if (pendingOrderId) {
      createNewPayment(pendingOrderId);
    } else {
      setError('Không tìm thấy đơn hàng cần thanh toán');
    }
  };
  
  const createNewPayment = async (orderId) => {
    try {
      setLoading(true);
      const paymentResponse = await axiosInstance.post(
        'http://localhost:5000/api/v1/payment/create-payment-link', 
        { orderId }
      );
      
      if (paymentResponse.data && paymentResponse.data.checkoutUrl) {
        window.location.href = paymentResponse.data.checkoutUrl;
      } else {
        setError('Không thể tạo liên kết thanh toán mới');
        setLoading(false);
      }
    } catch (payError) {
      console.error('Payment error:', payError);
      setError('Lỗi tạo liên kết thanh toán');
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="payos-container">
        <div className="payos-content">
          <h1>Đang kiểm tra thanh toán...</h1>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="payos-container">
      <div className="payos-content">
        {status === 'PAID' ? (
          <div className="payment-success">
            <h1>Thanh toán thành công!</h1>
            <p>Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận.</p>
            <button className="primary-button" onClick={handleGoHome}>
              Về trang chủ
            </button>
          </div>
        ) : status === 'CANCELLED' ? (
          <div className="payment-cancelled">
            <h1>Thanh toán đã bị hủy</h1>
            <p>Bạn đã hủy quá trình thanh toán.</p>
            <div className="button-group">
              <button className="secondary-button" onClick={handleRetry}>
                Thử lại
              </button>
              <button className="primary-button" onClick={handleGoHome}>
                Về trang chủ
              </button>
            </div>
          </div>
        ) : status === 'ERROR' ? (
          <div className="payment-error">
            <h1>Thanh toán thất bại</h1>
            <p>Đã xảy ra lỗi trong quá trình thanh toán.</p>
            <div className="button-group">
              <button className="secondary-button" onClick={handleRetry}>
                Thử lại
              </button>
              <button className="primary-button" onClick={handleGoHome}>
                Về trang chủ
              </button>
            </div>
          </div>
        ) : (
          <div className="payment-error">
            <h1>Có lỗi xảy ra</h1>
            <p>{error || 'Không thể xác minh trạng thái thanh toán'}</p>
            <button className="primary-button" onClick={handleGoHome}>
              Về trang chủ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayOSQR;