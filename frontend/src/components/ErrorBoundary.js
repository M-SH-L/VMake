// src/components/ErrorBoundary.js
import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Alert } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    // You can also log the error to an error reporting service here
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h5" component="h2" gutterBottom color="error">
              Something went wrong
            </Typography>
            
            <Alert severity="error" sx={{ mb: 3 }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Alert>
            
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <Box sx={{ my: 2, textAlign: 'left' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Error Details (Development Only):
                </Typography>
                <pre style={{ 
                  overflow: 'auto', 
                  padding: '1rem',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px'
                }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </Box>
            )}
            
            <Button 
              variant="contained" 
              color="primary" 
              onClick={this.handleRetry}
              sx={{ mt: 2 }}
            >
              Try Again
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;