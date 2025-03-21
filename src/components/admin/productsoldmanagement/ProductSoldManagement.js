import React, { useState, useEffect } from 'react';
import './ProductSoldManagement.css';
import { getSoldProducts, getSoldProductsAnalytics } from '../../../services/productSoldService';

const ProductSoldManagement = () => {
  const [soldProducts, setSoldProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    inStock: false,
    soldOut: false
  });
  const productsPerPage = 5;

  useEffect(() => {
    fetchSoldProducts();
    fetchAnalytics();
  }, []);

  const fetchSoldProducts = async () => {
    try {
      setLoading(true);
      const response = await getSoldProducts();
      
      // Xác định trạng thái chính xác dựa trên quantity
      const productsWithFixedStatus = response.soldProducts.map(product => ({
        ...product,
        productStatus: product.quantity > 0 ? 'In Stock' : 'Sold Out'
      }));
      
      setSoldProducts(productsWithFixedStatus);
      setFilteredProducts(productsWithFixedStatus);
      setTotalPages(Math.ceil(productsWithFixedStatus.length / productsPerPage));
      setLoading(false);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách sản phẩm đã bán:', err);
      setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await getSoldProductsAnalytics();
      setAnalytics(response.analytics);
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu thống kê:', err);
    }
  };

  // Định dạng tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Định dạng ngày tháng
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Lọc sản phẩm theo trạng thái
  useEffect(() => {
    let filtered = [...soldProducts];
    
    if (filters.inStock && !filters.soldOut) {
      filtered = filtered.filter(product => product.quantity > 0);
    } else if (!filters.inStock && filters.soldOut) {
      filtered = filtered.filter(product => product.quantity <= 0);
    }
    
    setFilteredProducts(filtered);
    setTotalPages(Math.ceil(filtered.length / productsPerPage));
    setCurrentPage(1);
  }, [filters, soldProducts]);

  // Lấy sản phẩm cho trang hiện tại
  const getCurrentProducts = () => {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  };

  // Xử lý thay đổi trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  // Tạo phân trang
  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          className={`product-sold-pagination-button ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    return (
      <div className="product-sold-pagination">
        {pages}
      </div>
    );
  };

  // Xác định trạng thái dựa trên quantity
  const getProductStatus = (quantity) => {
    return quantity > 0 ? 'In Stock' : 'Sold Out';
  };

  if (loading) return <div className="product-sold-loading">Đang tải danh sách sản phẩm...</div>;
  if (error) return <div className="product-sold-error">{error}</div>;

  return (
    <div className="product-sold-container">
      <div className="product-sold-content">
        <h1 className="product-sold-title">Quản lý sản phẩm đã bán</h1>
        
        <div className="product-sold-controls">
          <div className="product-sold-filter">
            <label className="product-sold-filter-label">
              <input 
                type="checkbox" 
                checked={filters.inStock}
                onChange={() => handleFilterChange('inStock')}
              />
              In Stock
            </label>
            <label className="product-sold-filter-label">
              <input 
                type="checkbox" 
                checked={filters.soldOut}
                onChange={() => handleFilterChange('soldOut')}
              />
              Sold Out
            </label>
          </div>
        </div>
        
        <div className="product-sold-table-container">
          <div className="product-sold-pagination-container">
            {renderPagination()}
          </div>
          
          <table className="product-sold-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên sản phẩm</th>
                <th>Giá</th>
                <th>Số lượng</th>
                <th>Tổng tiền</th>
                <th>Ngày bán</th>
                <th>Trạng thái</th>
                <th>Loại</th>
              </tr>
            </thead>
            <tbody>
              {getCurrentProducts().map(product => {
                // Xác định trạng thái dựa trên quantity
                const status = getProductStatus(product.quantity);
                
                return (
                  <tr key={product._id}>
                    <td>#{product._id.substring(0, 8)}</td>
                    <td>{product.productName}</td>
                    <td>{formatCurrency(product.productPrice)}</td>
                    <td>{product.quantity}</td>
                    <td>{formatCurrency(product.total)}</td>
                    <td>{formatDate(product.createdAt)}</td>
                    <td className={`product-sold-status product-status-${status === 'In Stock' ? 'instock' : 'soldout'}`}>
                      {status}
                    </td>
                    <td>
                      {product.type === 'set' ? 'Bộ sưu tập' : 'Sản phẩm đơn'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {analytics && (
          <div className="product-sold-summary">
            <div className="product-sold-summary-item">
              <span>Tổng doanh thu:</span> {formatCurrency(analytics.totalSales)}
            </div>
            <div className="product-sold-summary-item">
              <span>Sản phẩm có doanh thu cao nhất:</span> {analytics.highestProduct?.name} ({formatCurrency(analytics.highestProduct?.total)})
            </div>
            <div className="product-sold-summary-detail">
              <div className="product-sold-summary-count">
                <span>Sản phẩm còn hàng:</span> {analytics.inStockCount}
              </div>
              <div className="product-sold-summary-count">
                <span>Sản phẩm hết hàng:</span> {analytics.soldOutCount}
              </div>
              <div className="product-sold-summary-count">
                <span>Tổng sản phẩm đã bán:</span> {analytics.totalProducts}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSoldManagement;