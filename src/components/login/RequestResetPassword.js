import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import { axiosInstance } from '../../services/tokenService';

const RequestResetPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);
    
    try {
      // Gửi URL của trang reset mật khẩu frontend
      const redirectUrl = `${window.location.origin}`;
      
      const response = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/auth/requestResetPassword`, {
        email,
        redirectUrl
      });
      
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Yêu cầu đặt lại mật khẩu</h2>
      
      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}
      
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email address</label>
          <input 
            type="email" 
            id="email" 
            placeholder="Nhập email của bạn" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button 
          type="submit" 
          className="auth-button" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang xử lý...' : 'Gửi yêu cầu'}
        </button>
      </form>

      <div className="auth-footer">
        <Link to="/login">Quay lại đăng nhập</Link>
      </div>
    </div>
  );
};

export default RequestResetPassword;