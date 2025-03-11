import React from 'react';
import AdminHeader from '../header/AdminHeader';
import Footer from '../footer/Footer';

const AdminLayout = ({ children }) => {
  return (
    <div className="app">
      <AdminHeader />
      <main className="main">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default AdminLayout;