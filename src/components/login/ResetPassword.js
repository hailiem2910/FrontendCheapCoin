import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import { axiosInstance } from '../../services/tokenService';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [token, setToken] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Lấy token từ URL query parameter
    const queryParams = new URLSearchParams(location.search);
    const tokenFromUrl = queryParams.get('token');
    
    if (!tokenFromUrl) {
      setError('Không tìm thấy token trong URL.');
      return;
    }
    
    setToken(tokenFromUrl);
    
    // Kiểm tra tính hợp lệ của token
    const verifyToken = async () => {
      try {
        await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/v1/auth/resetPassword?token=${tokenFromUrl}`);
        setIsValidToken(true);
      } catch (err) {
        setError(err.response?.data?.error || 'Token không hợp lệ hoặc đã hết hạn.');
      }
    };
    
    verifyToken();
  }, [location]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    // Kiểm tra mật khẩu xác nhận
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/api/v1/auth/resetPassword`, {
        token,
        newPassword
      });
      
      setMessage(response.data.message);
      
      // Chuyển hướng về trang đăng nhập sau 3 giây
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="auth-container">
        <h2 className="auth-title">Đặt lại mật khẩu</h2>
        <div className="error-message">{error || 'Đang kiểm tra token...'}</div>
        <div className="auth-footer">
          <Link to="/login">Quay lại đăng nhập</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h2 className="auth-title">Đặt lại mật khẩu</h2>
      
      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}
      
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="newPassword">Mật khẩu mới</label>
          <input 
            type="password" 
            id="newPassword" 
            placeholder="Nhập mật khẩu mới" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength="6"
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
          <input 
            type="password" 
            id="confirmPassword" 
            placeholder="Nhập lại mật khẩu mới" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button 
          type="submit" 
          className="auth-button" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
        </button>
      </form>

      <div className="auth-footer">
        <Link to="/login">Quay lại đăng nhập</Link>
      </div>
    </div>
  );
};

export default ResetPassword;