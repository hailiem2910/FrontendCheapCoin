import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminHeader.css';
import logoImage from '../../img/LOGO CHEAP COIN.png'
const AdminHeader = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  return (
    <header className="admin-header">
      <div className="admin-header-container">
      <div className="admin-logo">
          <img src={logoImage} alt="CHEAPCOIN" className="logo-image" />
        </div>
        <nav className="admin-nav-menu">
        <Link to="/admin/dashboard" className="admin-nav-link">Dashboard</Link>
          <Link to="/admin/orders" className="admin-nav-link">Orders Management</Link>
          <Link to="/admin/sold-products" className="admin-nav-link">Products Sold Management</Link>
          {/* <Link to="/admin/products" className="admin-nav-link">Products Management</Link> */}
          <Link to="/admin/add-series" className="admin-nav-link">Add Series</Link>
        </nav>
        <div className="admin-user-menu">
          <div className="admin-notifications">
            <i className="fas fa-bell notification-icon"></i>
            <span className="notification-badge">2</span>
          </div>
          <div className="admin-profile">
            <span className="admin-label">Admin</span>
            <button onClick={handleLogout} className="admin-logout-btn">Logout</button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;