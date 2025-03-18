import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Header from "./components/header/Header";
import HomePage from "./components/homepage/Homepage";
import Footer from "./components/footer/Footer";
import './App.css'
import ProductPage from "./components/product/ProductPage";
import ProductDetail from "./components/productdetail/ProductDetail";
import Cart from "./components/cart/Cart";
import Checkout from "./components/checkout/Checkout";
import PayOSQR from "./components/payosqr/PayOSQR"; 
import Login from "./components/login/Login";
import Signup from "./components/signup/SignUp";
import RequestResetPassword from "./components/login/RequestResetPassword";
import ResetPassword from "./components/login/ResetPassword";

import AdminRoute from "./components/admin/AdminRoute";
import { isAuthenticated, setAuthHeader } from './services/tokenService';
import AddSeries from "./components/admin/addseries/AddSeries"; 
import OrdersManagement from "./components/admin/ordermanagement/OrdersManagement";
import ProductSoldManagement from "./components/admin/productsoldmanagement/ProductSoldManagement";
import Dashboard from "./components/admin/dashboard/Dashboard";
import OrderDetail from "./components/admin/orderdetail/OrderDetail";

const PrivateRoute = ({ children }) => {
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

  // Redirect admin to admin dashboard
  if (userRole === 'Admin') {
    return <Navigate to="/admin/dashboard" />;
  }

  return isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setAuthHeader(token);
    }
  }, []);

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          } />
          <Route path="/admin/add-series" element={
            <AdminRoute>
              <AddSeries />
            </AdminRoute>
          } />
          <Route path="/admin/products" element={
            <AdminRoute>
              <div>Products Management</div>
            </AdminRoute>
          } />
          <Route path="/admin/orders" element={
            <AdminRoute>
              <OrdersManagement />
            </AdminRoute>
          } />
          <Route path="/admin/orders/:orderId" element={
            <AdminRoute>
              <OrderDetail />
            </AdminRoute>
          } />
          <Route path="/admin/sold-products" element={
            <AdminRoute>
              <ProductSoldManagement />
            </AdminRoute>
          } />
          {/* Customer Routes */}
          <Route path="/" element={
            <PrivateRoute>
              <div className="app">
                <Header />
                <main className="main">
                  <HomePage />
                </main>
                <Footer />
              </div>
            </PrivateRoute>
          } />
          <Route path="/product" element={
            <div className="app">
              <Header />
              <main className="main">
                <ProductPage />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/product/:id" element={
            <div className="app">
              <Header />
              <main className="main">
                <ProductDetail />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/cart" element={
            <div className="app">
              <Header />
              <main className="main">
                <Cart />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/checkout" element={
            <div className="app">
              <Header />
              <main className="main">
                <Checkout />
              </main>
              <Footer />
            </div>
          } />
          {/* Add PayOS QR component route */}
          <Route path="/payos-qr" element={
            <div className="app">
              <Header />
              <main className="main">
                <PayOSQR />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/request-reset-password" element={<RequestResetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;