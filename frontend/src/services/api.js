// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

const api = {
  processProject: async (projectData) => {
    try {
      const response = await apiClient.post('/api/process-project', projectData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to process project');
    }
  },

  storeProject: async (projectData) => {
    try {
      const response = await apiClient.post('/api/store-project', projectData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to store project');
    }
  },

  verifyPayment: async (transactionId) => {
    try {
      const response = await apiClient.post('/api/verify-payment', { transactionId });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to verify payment');
    }
  },

  updateProjectStatus: async (projectData) => {
    try {
      const response = await apiClient.post('/api/update-project-status', projectData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update project status');
    }
  }
};

export default api;