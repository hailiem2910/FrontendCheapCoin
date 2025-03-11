import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSeriesById } from '../../services/seriesService';
import { addToCart } from '../../services/cartService'; // Import the cart service
import './ProductDetail.css';

// ProductImages component remains the same
const ProductImages = ({ seriesData }) => {
  const [selectedImage, setSelectedImage] = useState(
    seriesData?.series?.posterImageURL || "/default-placeholder.png"
  );

  useEffect(() => {
    if (seriesData?.series?.posterImageURL) {
      setSelectedImage(seriesData.series.posterImageURL);
    }
  }, [seriesData]);

  const allImages = [
    seriesData?.series?.posterImageURL,
    ...(seriesData?.series?.imageUrls || [])
  ].filter((url, index, self) => 
    url && self.indexOf(url) === index
  );

  return (
    <div className="product-gallery">
      <div className="thumbnail-list">
        {allImages.map((img, index) => (
          <div
            key={index}
            className={`thumbnail ${selectedImage === img ? 'active' : ''}`}
            onClick={() => setSelectedImage(img)}
          >
            <img src={img} alt={`Thumbnail ${index}`} />
          </div>
        ))}
      </div>
      <div className="main-image">
        <img src={selectedImage} alt="Main product" />
      </div>
    </div>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedType, setSelectedType] = useState('set'); // Changed from selectedSize to selectedType with default 'set'
  const [seriesData, setSeriesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchSeriesData = async () => {
      try {
        setLoading(true);
        const response = await getSeriesById(id);
        setSeriesData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch series details:', err);
        setError('Failed to load product details. Please try again later.');
        setLoading(false);
      }
    };

    if (id) {
      fetchSeriesData();
    }
  }, [id]);

  const handleTypeSelect = (type) => {
    setSelectedType(type); // Changed from handleSizeSelect to handleTypeSelect
  };

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      setMessage(null);
      
      const cartData = {
        seriesId: id,
        quantity: quantity,
        type: selectedType // Changed from size to type
      };
      
      console.log("Sending data to cart:", cartData);

      const response = await addToCart(cartData);
      setMessage({ type: 'success', text: 'Added to cart successfully!' });
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to add to cart. Please try again.' });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    // First add to cart, then navigate to checkout
    await handleAddToCart();
    window.location.href = '/cart'; // Using window.location for simplicity, but useNavigate would be better
  };

  if (loading) return <div className="loading">Loading product details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!seriesData) return <div className="error">Product not found</div>;

  // Destructure series data for easier access
  const { series } = seriesData;

  return (
    <div className="product-detail-container">
      <div className="product-header">
        <h1>{series.name}</h1>
      </div>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message.text}
        </div>
      )}

      <div className="product-main">
        <ProductImages seriesData={seriesData} />

        <div className="product-info">
          {series.isTagNew && <div className="status-tag">New</div>}
          <h2>{series.name}</h2>
          <div className="price-section">
            <div className="price-row">
              <span className="price-label">PRICE</span>
              <span className="price-amount">{series.price.toLocaleString()} Đ</span>
            </div>
          </div>
          <div className="divider"></div>

          <div className="type-section"> 
            <h3>TYPE</h3> {/* Changed from SIZE to TYPE */}
            <div className="type-buttons"> 
              <button 
                className={`type-button ${selectedType === 'set' ? 'selected' : ''}`} 
                onClick={() => handleTypeSelect('set')} 
              >
                Full Set
              </button>
              <button 
                className={`type-button ${selectedType === 'single' ? 'selected' : ''}`} 
                onClick={() => handleTypeSelect('single')} 
              >
                Single Box
              </button>
            </div>
          </div>

          <div className="quantity-section">
            <h3>QUANTITY</h3>
            <div className="quantity-controls">
              <button 
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                className="quantity-btn"
              >
                -
              </button>
              <span>{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="quantity-btn"
              >
                +
              </button>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              className="add-to-cart" 
              onClick={handleAddToCart}
              disabled={addingToCart}
            >
              {addingToCart ? 'Adding...' : 'Add To Cart'}
            </button>
            <button 
              className="buy-now" 
              onClick={handleBuyNow}
              disabled={addingToCart}
            >
              Buy Now
            </button>
          </div>

          <div className="product-details">
            <h3>DETAILS</h3>
            <ul>
              <li>BRAND: CHIBI COIN</li>
              <li>SIZE: {series.size || 'HEIGHT ABOUT 10CM - 12CM'}</li>
              <li>MATERIAL: {series.material || 'PVC/ABS/Hardware/Magnet'}</li>
              <li>TOTAL CHARACTERS: {series.totalCharacters || 'N/A'}</li>
              <li>ITEM FUNCTION FEATURES A BUILT-IN MAGNET!!</li>
              <li>{series.description}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="product-information">
        <h3>INFORMATION</h3>
        <div className='table-information'>
          <table className="info-table">
            <tbody>
              <tr>
                <th colSpan="2">PRODUCT NAME</th>
              </tr>
              <tr>
                <td colSpan="2">{series.name}</td>
              </tr>
              <tr>
                <th>MATERIAL:</th>
                <th>MANUFACTURER:</th>
              </tr>
              <tr>
                <td>{series.material || 'PVC/ABS/Hardware/Magnet'}</td>
                <td>CHEAPCOIN</td>
              </tr>
              <tr>
                <th>AGE:</th>
                <th>SIZE:</th>
              </tr>
              <tr>
                <td>{series.ageToUse || '15+'}</td>
                <td>{series.size || 'Height about 10cm - 12cm'}</td>
              </tr>
            </tbody>
          </table>
          <div className="info-notes">
            <p>Due to the different measurement methods, the actual measurement may vary between a normal range of 0.5 to 1 cm.</p>
            <p>Actual product, size, and color may differ due to lighting, display screen photography style and other factors. Display picture and size is for reference only.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;