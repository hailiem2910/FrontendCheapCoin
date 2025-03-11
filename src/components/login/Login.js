import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import './Login.css';
import { axiosInstance, setAuthHeader } from '../../services/tokenService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Xử lý đăng nhập thông thường
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await axiosInstance.post('http://localhost:5000/api/v1/auth/login', { email, password });
      
      // Lưu token vào localStorage
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);

      // Thiết lập authorization header cho requests sau này
      setAuthHeader(response.data.accessToken);
      
      // Chuyển hướng đến trang chủ sau khi đăng nhập thành công
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại. Vui lòng thử lại.');
    }
  };

  // Xử lý khi Google login thành công
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      
      const backendResponse = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/auth/google-login`, { token: credential });
      
      // Lưu token vào localStorage
      localStorage.setItem('accessToken', backendResponse.data.accessToken);
      localStorage.setItem('refreshToken', backendResponse.data.refreshToken);

      // Thiết lập authorization header cho requests sau này
      setAuthHeader(backendResponse.data.accessToken);

      // Chuyển hướng đến trang chủ sau khi đăng nhập thành công
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Sign In to CHEAPCOIN</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email address</label>
          <input 
            type="email" 
            id="email" 
            placeholder="Enter your email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password" 
            placeholder="Enter your password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="forgot-password">
            <Link to="/request-reset-password">Forgot Password?</Link>
          </div>
        </div>
        <button type="submit" className="auth-button">Sign In</button>
      </form>

      <div className="auth-divider">
        <span>Or</span>
      </div>

      <div className="social-buttons">
        <div className="google-login-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setError('Đăng nhập Google thất bại. Vui lòng thử lại.');
            }}
            useOneTap
            theme="filled_blue"
            text="signin_with"
            shape="rectangular"
            logo_alignment="center"
          />
        </div>
      </div>

      <div className="auth-footer">
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </div>
    </div>
  );
};

export default Login;