// src/utils/connectionUtils.js
import api from '../services/api';

export const testBackendConnection = async () => {
  try {
    const response = await api.get('/api/health');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to connect to server'
    };
  }
};

export const testGeminiConnection = async () => {
  try {
    const response = await api.get('/api/test-gemini');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Gemini connection test failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to connect to Gemini AI'
    };
  }
};

export const runAllConnectionTests = async () => {
  const results = {
    backend: await testBackendConnection(),
    gemini: await testGeminiConnection()
  };

  return {
    success: Object.values(results).every(result => result.success),
    results
  };
};