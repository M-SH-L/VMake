// frontend/src/config/config.js
const config = {
    development: {
      apiUrl: 'http://localhost:3001',
      geminiApiUrl: process.env.REACT_APP_GEMINI_API_URL
    },
    production: {
      apiUrl: process.env.REACT_APP_API_URL || 'https://vmake-chatbot-backend.onrender.com',
      geminiApiUrl: process.env.REACT_APP_GEMINI_API_URL
    }
  };
  
  const environment = process.env.NODE_ENV || 'development';
  export default config;