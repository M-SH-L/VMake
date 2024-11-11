// frontend/src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // Increased to 120 seconds for longer AI processing
});

// Custom error handler
const handleApiError = (error, context) => {
  // Log error details
  console.error(`Error in ${context}:`, {
    message: error.message,
    code: error.code,
    status: error.response?.status,
    data: error.response?.data
  });

  // Handle specific error types
  if (error.code === 'ECONNABORTED') {
    throw new Error('Request is taking longer than expected. The server might be busy processing your project. Please try again.');
  }

  if (!error.response) {
    throw new Error('Unable to reach the server. Please check your internet connection and try again.');
  }

  // Handle different HTTP status codes
  switch (error.response.status) {
    case 400:
      throw new Error('Invalid request. Please check your input and try again.');
    case 401:
      throw new Error('Authentication failed. Please try again.');
    case 403:
      throw new Error('You do not have permission to perform this action.');
    case 404:
      throw new Error('The requested resource was not found.');
    case 500:
      throw new Error('Server encountered an error. Please try again in a few minutes.');
    default:
      throw new Error(error.response.data?.message || 'An unexpected error occurred. Please try again.');
  }
};

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    const method = config.method?.toUpperCase() || 'UNKNOWN';
    console.log(`[API] ${method} Request to: ${config.url}`, {
      data: config.data,
      params: config.params
    });
    return config;
  },
  (error) => {
    console.error('[API] Request Error:', error.message);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response from ${response.config.url}:`, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('[API] Response Error:', {
      url: error.config?.url,
      method: error.config?.method,
      error: error.message
    });
    return Promise.reject(error);
  }
);

// API Functions with improved error handling
export const processProject = async (data) => {
  try {
    console.log('[API] Processing project:', { projectName: data.projectName });
    const response = await api.post('/api/process-project', data);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'processProject');
  }
};

export const storeProject = async (data) => {
  try {
    console.log('[API] Storing project:', { projectName: data.projectName });
    const response = await api.post('/api/store-project', data);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'storeProject');
  }
};

export const verifyPayment = async (data) => {
  try {
    console.log('[API] Verifying payment:', { transactionId: data.transactionId });
    const response = await api.post('/api/verify-payment', data);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'verifyPayment');
  }
};

export const updateProjectStatus = async (data) => {
  try {
    console.log('[API] Updating project status:', { 
      projectName: data.projectName,
      status: data.status 
    });
    const response = await api.post('/api/update-project-status', data);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'updateProjectStatus');
  }
};

export const checkHealth = async () => {
  try {
    console.log('[API] Checking server health');
    const response = await api.get('/api/health');
    return response.data;
  } catch (error) {
    return handleApiError(error, 'checkHealth');
  }
};

// Add retry functionality for failed requests
export const retryRequest = async (apiFunction, data, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[API] Attempt ${attempt} of ${maxRetries}`);
      const result = await apiFunction(data);
      return result;
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      console.log(`[API] Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export default api;