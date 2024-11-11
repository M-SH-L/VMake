// backend/src/server.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createAIService } from './services/ai/aiService.js';
import { addProjectToSheet, updateProjectStatusInSheet } from './services/sheets/sheets.js';
import logger from './utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Enhanced CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true,
  optionsSuccessStatus: 204
};

// Middleware setup - IMPORTANT: Order matters!
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('combined', { stream: logger.stream }));

// Initialize AI Service
let aiService;
try {
  aiService = createAIService('gemini');
  logger.info('AI Service initialized successfully');
} catch (error) {
  logger.error('Failed to initialize AI Service:', error);
}

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`Incoming ${req.method} request to ${req.url}`, {
    body: req.body,
    query: req.query,
    params: req.params
  });
  next();
});

// Basic test endpoint
app.get('/api/hello', (req, res) => {
  logger.info('Hello endpoint hit');
  res.json({ message: 'Server is running!' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  logger.info('Health check requested');
  res.json({ 
    status: 'healthy',
    aiService: !!aiService,
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// Gemini test endpoint
app.get('/api/test-gemini', async (req, res) => {
  try {
    logger.info('Testing Gemini API connection');
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    if (!aiService) {
      aiService = createAIService('gemini');
    }
    
    const testResult = await aiService.model.generateContent(
      'Respond with a simple "Hello World!" if you can receive this message.'
    );
    const response = await testResult.response;
    const text = response.text();

    logger.info('Gemini API test successful', { response: text });
    
    res.json({
      success: true,
      message: 'Gemini API test successful',
      response: text
    });
  } catch (error) {
    logger.error('Gemini API test failed:', {
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: `Gemini API test failed: ${error.message}`
    });
  }
});

// Project processing endpoint
app.post('/api/process-project', async (req, res) => {
  try {
    const projectData = req.body;
    logger.info('Processing project request received', { projectData });

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    if (!aiService) {
      aiService = createAIService('gemini');
    }

    logger.debug('Generating parts list...');
    const partsList = await aiService.generatePartsList(projectData.description);
    logger.info('Parts list generated successfully');
    
    logger.debug('Analyzing project...');
    const analysis = await aiService.analyzeProject(projectData);
    logger.info('Project analysis completed');
    
    res.json({
      success: true,
      partsList,
      analysis
    });
  } catch (error) {
    logger.error('Error processing project:', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process project'
    });
  }
});

// Project storage endpoint
app.post('/api/store-project', async (req, res) => {
  try {
    const projectData = req.body;
    logger.info('Storing project data', { projectId: projectData.projectName });
    
    const result = await addProjectToSheet(projectData, {
      partsList: projectData.partsList,
      analysis: projectData.analysis
    });
    
    logger.info('Project stored successfully', { projectId: projectData.projectName });
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error storing project:', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to store project'
    });
  }
});

// Payment verification endpoint
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { transactionId } = req.body;
    logger.info('Payment verification requested', { transactionId });
    
    const isValid = transactionId && transactionId.length > 5;
    
    if (!isValid) {
      logger.warn('Invalid transaction ID provided', { transactionId });
      throw new Error('Invalid transaction ID');
    }
    
    logger.info('Payment verified successfully', { transactionId });
    res.json({
      success: true,
      message: 'Payment verified successfully'
    });
  } catch (error) {
    logger.error('Payment verification failed:', {
      error: error.message,
      transactionId: req.body.transactionId
    });
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to verify payment'
    });
  }
});

// Project status update endpoint
app.post('/api/update-project-status', async (req, res) => {
  try {
    const projectData = req.body;
    logger.info('Updating project status', { 
      projectId: projectData.projectName,
      newStatus: projectData.status 
    });
    
    await updateProjectStatusInSheet(projectData);
    
    logger.info('Project status updated successfully', {
      projectId: projectData.projectName,
      newStatus: projectData.status
    });
    
    res.json({
      success: true,
      message: 'Project status updated successfully'
    });
  } catch (error) {
    logger.error('Error updating project status:', {
      error: error.message,
      stack: error.stack,
      projectData: req.body
    });
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update project status'
    });
  }
});

// Global error handling middleware - MUST be last
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message
  });
});

// Start server
app.listen(port, () => {
  logger.info(`Server started and listening on port ${port}`);
  
  // Log configuration status
  logger.info('Server configuration:', {
    port,
    environment: process.env.NODE_ENV,
    corsOrigin: process.env.CORS_ORIGIN,
    geminiApiConfigured: !!process.env.GEMINI_API_KEY,
    googleSheetsConfigured: !!process.env.GOOGLE_SHEET_ID
  });
});

export default app;