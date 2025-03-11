import React from 'react';
import './ProductPage.css';

const ProductPage = () => {
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

  const products = [
    {
      id: 1,
      image: "/api/placeholder/240/320",
      name: "CHIBI DELUXE FIGURE",
      price: "220.000 Đ"
    },
    {
      id: 2,
      image: "/api/placeholder/240/320",
      name: "SAMURAI EDITION LIMITED",
      price: "220.000 Đ"
    },
    {
      id: 3,
      image: "/api/placeholder/240/320",
      name: "BLACK BUNNY HALLOWEEN EDITION",
      price: "220.000 Đ"
    },
    {
      id: 4,
      image: "/api/placeholder/240/320",
      name: "OTONEKO - HOLIDAY EDITION",
      price: "220.000 Đ"
    }
  ];

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
                    <input type="checkbox" />
                    <label className="checkbox-label">{item}</label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="main-content">
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image-container">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                  />
                </div>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">{product.price}</p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button className="page-button">&lt;</button>
            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                className={`page-button ${page === 1 ? 'active' : ''}`}
              >
                {page}
              </button>
            ))}
            <button className="page-button">&gt;</button>
          </div>
        </div>
      </div>       
    </div>
  );
};

export default ProductPage;