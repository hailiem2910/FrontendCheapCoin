import React from 'react';
import { Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';

const AdminRoute = ({ children }) => {
  const accessToken = localStorage.getItem('accessToken');
  
  // Decode token to check role
  const decodeToken = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      return null;
    }
  };

  if (!accessToken) {
    return <Navigate to="/login" />;
  }

  const decodedToken = decodeToken(accessToken);
  const userRole = decodedToken?.role;

  if (userRole !== 'Admin') {
    return <Navigate to="/" />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

export default AdminRoute;