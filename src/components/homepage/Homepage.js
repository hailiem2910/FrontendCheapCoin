import React, { useState, useEffect } from 'react';
import './Homepage.css';
import "./Specialbanner.css";
import { Link } from 'react-router-dom';
import happyNewYearImg from './../../img/happynewyear.png';
import Cover from './../../img/COVER 1.png'
import comingsoon from './../../img/coming soon.png';
import cardN2 from './../../img/card N2.png';
import cardN1 from './../../img/card N1.png';
import { getAllSeries } from '../../services/seriesService';

const carouselItems = [
  {
    id: 1,
    image: Cover,
  },
  {
    id: 2,
    image: comingsoon,
  },
];

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [allSeries, setAllSeries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch all series when component mounts
    const fetchSeries = async () => {
      try {
        setIsLoading(true);
        const response = await getAllSeries(1, 20); // Get 20 series to have enough for all sections
        setAllSeries(response.data || []);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch series:', err);
        setError('Failed to load products. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchSeries();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  // Helper function to get placeholder image if series has no image
  const getImageUrl = (series) => {
    return series.posterImageURL || "https://via.placeholder.com/300x300?text=No+Image";
  };

  const getSeriesImages = (series) => {
    // Mặt trước là posterImageURL (ảnh đại diện)
    const frontImage = series.posterImageURL || "https://via.placeholder.com/300x300?text=No+Image";
    
    // Mặt sau là ảnh thứ 2 trong mảng imageUrls nếu có, nếu không thì dùng mặt trước
    let backImage = frontImage;
    if (series.imageUrls && series.imageUrls.length > 1) {
      backImage = series.imageUrls[1];
    }
    
    return { frontImage, backImage };
  };

  // Extract just what we need for the first 4 series
  const newProductsSeries = allSeries.slice(0, 4);
  
  // Extract first 3 series for IKEMEN RECOMMENDATION
  const ikemenSeries = allSeries.slice(0, 3);
  
  // Extract first 4 series for COMING SOON
  const comingSoonSeries = allSeries.slice(0, 4);
  
  // Extract first 4 series for RESTOCKING SOON
  const restockingSeries = allSeries.slice(0, 4);

  if (isLoading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="home-container" style={{ fontFamily: "'Afacad', sans-serif" }}>
      <div className="special-banner">
        <img
          src={carouselItems[currentSlide].image}
          alt="Special banner"
          className="banner-image"
        />
        <button 
          onClick={prevSlide}
          className="banner-nav-button banner-prev"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <button 
          onClick={nextSlide}
          className="banner-nav-button banner-next"
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>

      <h2 className="new-products-title">NEW PRODUCTS</h2>
      <div className="product-grid">
  {newProductsSeries.map((series) => {
    const { frontImage, backImage } = getSeriesImages(series);
    return (
      <Link to={`/product/${series._id}`} key={series._id} className="new-product-item">
        <div className="product-card-home">
          <div className="product-card-inner">
            <div className="product-card-front">
              <img src={frontImage} alt={series.name} />
            </div>
            <div className="product-card-back">
              <img src={backImage} alt={`${series.name} back view`} />
            </div>
          </div>
        </div>
        <h3>{series.name}</h3>
        <p className="price">{series.price.toLocaleString()} Đ</p>
      </Link>
    );
  })}
</div>

      <h2 className="featured-title">FEATURED</h2>
      <div className="featured-grid">
        {[1, 2].map((item) => (
          <div key={item} className="featured-item">
            <img src={happyNewYearImg} alt="Featured" />
          </div>
        ))}
      </div>

      <h2 className="ikemen-series-recommendation-title">IKEMEN SEIRIES RECOMMENDATION</h2>
      <div className="recommendation-grid">
        {ikemenSeries.map((series) => (
          <div key={series._id} className="recommendation-item">
            <img src={getImageUrl(series)} alt={series.name} />
            <h3>{series.name}</h3>
          </div>
        ))}
      </div>

      <h2 className="recommended-for-you-title">RECOMMENDED FOR YOU</h2>
      <div className="recommended-grid">
        {[1, 2].map((item) => (
          <div key={item} className="recommended-item">
            <img src={cardN1} alt="Recommended" />
          </div>
        ))}
      </div>

      {/* <div className="categories-nav">
        <button className="category-button">BUNNY</button>
        <button className="category-button">TOP SELLING</button>
        <button className="category-button">IKEMEN</button>
        <button className="category-button">ACTION FIGURE</button>
        <button className="category-button">HARU VERS</button>
        <button className="category-button">NEKOMATA</button>
      </div>

      <div className="special-banner">
        <img
          src={cardN2}
          alt="Special banner"
          className="banner-image"
        />
      </div>

      <div className="get-rek-container">
        <button className="get-rek-button">GET REK ! </button>
      </div> */}

      <h2 className="section-title">TOP SELLINGS</h2>
      <div className="products-grid">
        {allSeries.map(series => (
          <div key={series._id} className="section-item">
            <Link to={`/product/${series._id}`}>
              <img src={getImageUrl(series)} alt={series.name} />
              <h3>{series.name}</h3>
              <p className="price">{series.price.toLocaleString()} Đ</p>
            </Link>
          </div>
        ))}
      </div>

      <h2 className="section-title">COMMING SOON</h2>
      <div className="products-grid">
        {comingSoonSeries.map(series => (
          <div key={series._id} className="product-item">
            <Link to={`/product/${series._id}`}>
              <img src={getImageUrl(series)} alt={series.name} />
              <h3>{series.name}</h3>
              <p className="price">{series.price.toLocaleString()} Đ</p>
            </Link>
          </div>
        ))}
      </div>

      <h2 className="section-title">RESTOCKING SOON</h2>
      <div className="products-grid">
        {restockingSeries.map(series => (
          <div key={series._id} className="product-item">
            <Link to={`/product/${series._id}`}>
              <img src={getImageUrl(series)} alt={series.name} />
              <h3>{series.name}</h3>
              <p className="price">{series.price.toLocaleString()} Đ</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;