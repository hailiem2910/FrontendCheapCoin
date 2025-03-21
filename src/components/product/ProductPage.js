import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ProductPage.css';
import { getAllSeries } from '../../services/seriesService';

const ProductPage = () => {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState({});

  // Danh mục sản phẩm
  const categories = [
    { id: 'preorder', title: 'PREORDER', items: [
      'ACTION FIGURE', 'BRAND', 'NENDOROID', 'GOTH', 'CHIBI FIGURE'
    ]},
    { id: 'hot', title: 'HOT', items: [
      'GIFTS', 'CHIBI DELUXE', 'DOLLS', 'KEY CHAINS', 'CABLE HOLDER EGO',
      'SPECIAL EDITION', 'HOME SWEET HOME'
    ]},
    { id: 'collection', title: 'COLLECTION', items: [
      'BUNNY SERIES', 'NENDOROID', 'FIGURINE', 'ACTION FIGURE', 'BRAND', 
      'SHIRO NEKO', 'GOTH', 'CHIBI DELUXE', 'DOLLS', 'KEY CHAINS',
      'CABLE HOLDER EGO', 'SPECIAL EDITION', 'HOME SWEET HOME', 'SERIES',
      'OTHERS'
    ]}
  ];

  // Hàm lấy dữ liệu series từ API
  const fetchSeries = async () => {
    try {
      setLoading(true);
      
      // Tạo filters dựa trên searchTerm và danh mục đã chọn
      let filters = {};
      if (searchTerm) {
        filters.name = searchTerm;
      }
      
      // Gọi API với thông số trang và bộ lọc
      const response = await getAllSeries(currentPage, 12, filters);
      
      if (response && response.data) {
        setSeries(response.data);
        setTotalPages(response.totalPages || 1);
      } else {
        setSeries([]);
        setTotalPages(1);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching series:', err);
      setError('Failed to load products. Please try again later.');
      setLoading(false);
    }
  };

  // Gọi API khi component mount hoặc khi currentPage, searchTerm thay đổi
  useEffect(() => {
    fetchSeries();
  }, [currentPage, searchTerm]);

  // Xử lý thay đổi trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  // Xử lý thay đổi tìm kiếm
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
      setSearchTerm(e.target.value);
    }
  };

  // Xử lý chọn danh mục
  const handleCategoryChange = (category, checked) => {
    setSelectedCategories(prev => ({
      ...prev,
      [category]: checked
    }));
    setCurrentPage(1); // Reset về trang 1 khi thay đổi bộ lọc
  };

  // Hàm lấy ảnh mặt trước và mặt sau
  const getSeriesImages = (seriesItem) => {
    // Mặt trước là posterImageURL (ảnh đại diện)
    const frontImage = seriesItem.posterImageURL || "https://via.placeholder.com/240/320?text=No+Image";
    
    // Mặt sau là ảnh thứ 2 trong mảng imageUrls nếu có, nếu không thì dùng mặt trước
    let backImage = frontImage;
    if (seriesItem.imageUrls && seriesItem.imageUrls.length > 1) {
      backImage = seriesItem.imageUrls[1];
    }
    
    return { frontImage, backImage };
  };

  return (
    <div className="product-container">
      {/* Search Bar */}
      <div className="search-container">
        <svg 
          className="search-icon" 
          viewBox="0 0 24 24" 
          width="20" 
          height="20"
        >
          <path 
            d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
            fill="currentColor"
          />
        </svg>
        <input 
          type="text" 
          placeholder="CHIBI" 
          className="search-input"
          onKeyPress={handleSearch}
        />
      </div>

      <div className='main-wrapper'>
        {/* Left Sidebar */}
        <div className="sidebar">
          {/* Categories */}
          {categories.map((category) => (
            <div key={category.id} className="category-section">
              <h3 className="category-title">{category.title}</h3>
              <div className="category-items">
                {category.items.map((item) => (
                  <div key={item} className="checkbox-group">
                    <input 
                      type="checkbox" 
                      onChange={(e) => handleCategoryChange(item, e.target.checked)}
                      checked={selectedCategories[item] || false}
                    />
                    <label className="checkbox-label">{item}</label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="main-content">
          {loading ? (
            <div className="loading-message">Loading products...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <>
              <div className="products-grid">
                {series.length > 0 ? (
                  series.map((item) => {
                    const { frontImage } = getSeriesImages(item);
                    return (
                      <Link to={`/product/${item._id}`} key={item._id} className="product-card-page">
  <div className="product-image-container">
    <img
      src={frontImage}
      alt={item.name}
      className="product-image"
    />
  </div>
  <h3 className="product-name">{item.name}</h3>
  <p className="product-price">{item.price.toLocaleString()} Đ</p>
</Link>
                    );
                  })
                ) : (
                  <div className="no-products-message">No products found</div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="page-button"
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    &lt;
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Hiển thị trang hiện tại, 2 trang trước và 2 trang sau
                      return Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages;
                    })
                    .map((page, index, array) => {
                      // Thêm dấu "..." nếu có trang bị bỏ qua
                      if (index > 0 && array[index - 1] !== page - 1) {
                        return (
                          <React.Fragment key={`ellipsis-${page}`}>
                            <span className="page-ellipsis">...</span>
                            <button
                              className={`page-button ${page === currentPage ? 'active' : ''}`}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      }
                      return (
                        <button
                          key={page}
                          className={`page-button ${page === currentPage ? 'active' : ''}`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      );
                    })}
                  
                  <button 
                    className="page-button"
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    &gt;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>       
    </div>
  );
};

export default ProductPage;