import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('accessToken');
  
  const handleLogout = () => {
    // Xóa tokens và thông tin user khỏi localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Chuyển hướng về trang login
    navigate('/login');
  };  
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">CHEAPCOIN</div>
        <nav className="nav-menu">
          <Link to="/" className="nav-link">HOME</Link>
          <Link to="/product" className="nav-link">PRODUCT</Link>
          <Link to="/news" className="nav-link">NEWS</Link>
          <Link to="/coming" className="nav-link">COMMING</Link>
        </nav>
        <div className="user-menu">
          {isLoggedIn ? (
            <div className="user-info">
              
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="login-link">LOG IN</Link>
              <span className="separator">/</span>
              <Link to="/signup" className="signup-link">SIGN UP</Link>
            </div>
          )}
          <Link to="/cart" className="cart-containers">
            <i className="fas fa-shopping-cart cart-icon"></i>
            {/* <span className="cart-badge">2</span> */}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;