// src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = {
  processProject: async (projectData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/process-project`, projectData);
      return response.data;
    } catch (error) {
      console.error('Failed to process project:', error);
      throw new Error(error.response?.data?.message || 'Failed to process project');
    }
  },

  storeProject: async (projectData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/store-project`, projectData);
      return response.data;
    } catch (error) {
      console.error('Failed to store project:', error);
      throw new Error(error.response?.data?.message || 'Failed to store project');
    }
  },

  verifyPayment: async (transactionId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/verify-payment`, {
        transactionId
      });
      return response.data;
    } catch (error) {
      console.error('Failed to verify payment:', error);
      throw new Error(error.response?.data?.message || 'Failed to verify payment');
    }
  },

  updateProjectStatus: async (projectData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/update-project-status`, projectData);
      return response.data;
    } catch (error) {
      console.error('Failed to update project status:', error);
      throw new Error(error.response?.data?.message || 'Failed to update project status');
    }
  }
};

export default api;