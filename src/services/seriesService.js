import { axiosInstance } from './tokenService';

// Get all series
const getAllSeries = async (page = 1, limit = 20, filters = {}, sort = {}) => {
  try {
    const params = {
      page,
      limit,
      ...filters,
      ...sort
    };
    const response = await axiosInstance.get('http://localhost:5000/api/v1/seri', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching series:', error);
    throw error;
  }
};

// Get a specific series by ID
const getSeriesById = async (id) => {
  try {
    const response = await axiosInstance.get(`http://localhost:5000/api/v1/seri/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching series by ID:', error);
    throw error;
  }
};

export { getAllSeries, getSeriesById };