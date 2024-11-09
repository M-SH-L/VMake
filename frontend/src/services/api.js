import axios from 'axios';
import config from '../config/config';

const API_URL = process.env.REACT_APP_API_URL || 'https://vmake-chatbot-backend.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const processProject = async (data) => {
  try {
    const response = await api.post('/api/process-project', data);
    return response.data;
  } catch (error) {
    console.error('Error processing project:', error);
    throw error;
  }
};

export const storeProject = async (data) => {
  try {
    const response = await api.post('/api/store-project', data);
    return response.data;
  } catch (error) {
    console.error('Error storing project:', error);
    throw error;
  }
};

export const verifyPayment = async (data) => {
  try {
    const response = await api.post('/api/verify-payment', data);
    return response.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

export const updateProjectStatus = async (data) => {
  try {
    const response = await api.post('/api/update-project-status', data);
    return response.data;
  } catch (error) {
    console.error('Error updating project status:', error);
    throw error;
  }
};

// Add error interceptor for common error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with a status code outside the 2xx range
      console.error('API Error Response:', error.response.data);
      console.error('API Error Status:', error.response.status);
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
    } else {
      // Error in setting up the request
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

// Add request interceptor for common headers or auth tokens if needed
api.interceptors.request.use(
  (config) => {
    // You can add common headers here
    // For example, if you need to add an auth token:
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    console.error('Request setup error:', error);
    return Promise.reject(error);
  }
);

export default api;