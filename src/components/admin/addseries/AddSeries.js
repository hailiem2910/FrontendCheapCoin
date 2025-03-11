import React, { useState, useEffect } from 'react';
import './AddSeries.css';
import axios from 'axios';
import { axiosInstance } from '../../../services/tokenService';

const AddSeries = () => {
  const [seriesData, setSeriesData] = useState({
    name: '',
    price: '',
    description: '',
    releaseDate: '',
    totalCharacters: '',
    size: '',
    material: '',
    ageToUse: '',
    quantity: '', // Added quantity field to state
    representativeImage: null
  });

  const [seriesList, setSeriesList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch all series when component mounts
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('http://localhost:5000/api/v1/seri', {
        params: {
          page: 1,
          limit: 10
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setSeriesList(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching series:', error);
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSeriesData({
        ...seriesData,
        representativeImage: e.target.files[0]
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSeriesData({
      ...seriesData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Create FormData object to handle file upload
      const formData = new FormData();
      
      // Append all form fields to FormData
      Object.keys(seriesData).forEach(key => {
        if (key === 'representativeImage' && seriesData[key]) {
          formData.append(key, seriesData[key]);
        } else if (seriesData[key] !== null && seriesData[key] !== '') {
          formData.append(key, seriesData[key]);
        }
      });

      // Make API call to create series
      await axios.post('http://localhost:5000/api/v1/seri/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      // Reset form after successful creation
      setSeriesData({
        name: '',
        price: '',
        description: '',
        releaseDate: '',
        totalCharacters: '',
        size: '',
        material: '',
        ageToUse: '',
        quantity: '', // Reset quantity field
        representativeImage: null
      });

      // Refresh the series list
      fetchSeries();
      setLoading(false);
      alert('Series created successfully!');
    } catch (error) {
      console.error('Error creating series:', error);
      setLoading(false);
      alert('Failed to create series. Please try again.');
    }
  };

  return (
    <div className="add-series-container">
      <h2>Series Management</h2>
      
      <div className="add-series-content">
        {/* Series List Table */}
        <div className="series-list-section">
          <h3>Series List</h3>
          <div className="series-table-container">
            <table className="series-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Size</th>
                  <th>Material</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="loading-message">Loading...</td>
                  </tr>
                ) : seriesList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="no-data-message">No series found</td>
                  </tr>
                ) : (
                  seriesList.map(series => (
                    <tr key={series._id}>
                      <td>{series.name}</td>
                      <td>${parseFloat(series.price).toFixed(2)}</td>
                      <td>{series.size}</td>
                      <td>{series.material}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Series Form */}
        <div className="add-series-form-section">
          <h3>Add New Series</h3>
          <form onSubmit={handleSubmit} className="series-form">
            <div className="form-add-series">
              <input
                type="text"
                name="name"
                placeholder="Series Name"
                value={seriesData.name}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-add-series">
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={seriesData.price}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            
            {/* New Quantity Field */}
            <div className="form-add-series">
              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={seriesData.quantity}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-add-series">
              <textarea
                name="description"
                placeholder="Description"
                value={seriesData.description}
                onChange={handleInputChange}
                className="form-textarea"
                rows="3"
                required
              />
            </div>
            
            <div className="form-add-series">
              <input
                type="date"
                name="releaseDate"
                placeholder="Release Date"
                value={seriesData.releaseDate}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-add-series">
              <input
                type="number"
                name="totalCharacters"
                placeholder="Total Characters"
                value={seriesData.totalCharacters}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-add-series">
              <input
                type="text"
                name="size"
                placeholder="Size"
                value={seriesData.size}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-add-series">
              <input
                type="text"
                name="material"
                placeholder="Material"
                value={seriesData.material}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-add-series">
              <input
                type="text"
                name="ageToUse"
                placeholder="Age Recommendation"
                value={seriesData.ageToUse}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-add-series">
              <label className="file-input-label">
                Representative Image:
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="form-file-input"
                  required
                />
              </label>
              {seriesData.representativeImage && (
                <p className="file-name">
                  Selected: {seriesData.representativeImage.name}
                </p>
              )}
            </div>
            
            <div className="action-buttons-addseries">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Creating...' : 'Add Series'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSeries;