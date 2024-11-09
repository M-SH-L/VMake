import React from 'react';
import { Button, Typography, Container, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to RoboChat
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Your AI assistant for electronics and robotics projects
        </Typography>
        <Typography variant="body1" paragraph>
          RoboChat helps you plan your electronics and robotics projects. We'll collect information about your project, analyze it, and provide you with a parts list to get started.
        </Typography>
        <Button
          component={Link}
          to="/chat"
          variant="contained"
          color="primary"
          size="large"
        >
          Start Chat
        </Button>
      </Box>
    </Container>
  );
};

export default LandingPage;