import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://vmake-chatbot-backend.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const processProject = async (data) => {
  try {
    console.log('Sending project data to backend:', data);
    const response = await api.post('/api/process-project', data);
    console.log('Received response from backend:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error processing project:', error);
    throw new Error(error.response?.data?.message || 'Failed to process project');
  }
};

const storeProject = async (data) => {
  try {
    console.log('Storing project data:', data);
    const response = await api.post('/api/store-project', data);
    return response.data;
  } catch (error) {
    console.error('Error storing project:', error);
    throw new Error(error.response?.data?.message || 'Failed to store project');
  }
};

const verifyPayment = async (data) => {
  try {
    console.log('Verifying payment:', data);
    const response = await api.post('/api/verify-payment', data);
    return response.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw new Error(error.response?.data?.message || 'Failed to verify payment');
  }
};

const updateProjectStatus = async (data) => {
  try {
    console.log('Updating project status:', data);
    const response = await api.post('/api/update-project-status', data);
    return response.data;
  } catch (error) {
    console.error('Error updating project status:', error);
    throw new Error(error.response?.data?.message || 'Failed to update project status');
  }
};

export {
  processProject,
  storeProject,
  verifyPayment,
  updateProjectStatus
};