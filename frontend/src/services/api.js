import axios from 'axios';

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

export default api;