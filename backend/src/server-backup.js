import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createAIService } from './services/ai/aiService.js';
import { addProjectToSheet } from './services/sheets/sheets.js';
import logger from './utils/logger.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Debug middleware
app.use((req, res, next) => {
  logger.info(`Incoming ${req.method} request to ${req.url}`);
  logger.info('Request body:', req.body);
  next();
});

// CORS and JSON middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Initialize AI Service
const aiService = createAIService('gemini');

// Test endpoint
app.get('/test', (req, res) => {
  logger.info('Test endpoint hit');
  res.json({ status: 'ok', message: 'Server is running' });
});

// Process project endpoint with detailed logging
app.post('/api/process-project', async (req, res) => {
  try {
    logger.info('Processing project request received');
    const { description, projectName } = req.body;

    if (!description) {
      logger.error('Missing project description');
      return res.status(400).json({
        success: false,
        message: 'Project description is required'
      });
    }

    logger.info('Generating parts list...');
    logger.info('Project description:', description);

    // Generate parts list with timeout
    const partsListPromise = aiService.generatePartsList(description);
    const partsList = await Promise.race([
      partsListPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Parts list generation timed out')), 30000)
      )
    ]);

    logger.info('Parts list generated successfully');
    logger.info('Parts list:', partsList);

    // Generate analysis with timeout
    logger.info('Starting project analysis...');
    const analysisPromise = aiService.analyzeProject({
      description,
      projectName
    });
    const analysis = await Promise.race([
      analysisPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Project analysis timed out')), 30000)
      )
    ]);

    logger.info('Analysis completed successfully');
    logger.info('Analysis:', analysis);

    // Send successful response
    res.json({
      success: true,
      partsList,
      analysis
    });

  } catch (error) {
    logger.error('Error in process-project endpoint:', error);
    logger.error('Error details:', {
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      message: `Failed to process project: ${error.message}`,
      error: process.env.DEBUG === 'true' ? error.stack : undefined
    });
  }
});

// Start server with environment info
app.listen(port, () => {
  logger.info('Server started');
  logger.info(`Port: ${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`Debug mode: ${process.env.DEBUG}`);
  logger.info(`CORS Origin: ${process.env.CORS_ORIGIN}`);
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: process.env.DEBUG === 'true' ? err.message : 'Internal server error'
  });
});