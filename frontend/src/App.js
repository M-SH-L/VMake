// src/App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Alert, Snackbar, CircularProgress, Box } from '@mui/material';
import LandingPage from './components/LandingPage';
import ChatInterface from './components/ChatInterface';
import ErrorBoundary from './components/ErrorBoundary';
import { runAllConnectionTests } from './utils/connectionUtils';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);

  useEffect(() => {
    checkConnections();
  }, []);

  const checkConnections = async () => {
    try {
      setIsLoading(true);
      const results = await runAllConnectionTests();
      setConnectionStatus(results);
      
      if (!results.success) {
        setError('Some services are not available. The app may have limited functionality.');
      }
    } catch (error) {
      setError('Failed to initialize application. Please try again later.');
      console.error('Connection test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <div className="App">
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError(null)}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>

        <Routes>
          <Route 
            path="/" 
            element={
              <ErrorBoundary>
                <LandingPage />
              </ErrorBoundary>
            } 
          />
          <Route 
            path="/chat" 
            element={
              <ErrorBoundary>
                <ChatInterface connectionStatus={connectionStatus} />
              </ErrorBoundary>
            } 
          />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default App;