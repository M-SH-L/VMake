// backend/src/server.js
import express from 'express';
import cors from 'cors';
import { createAIService } from './services/ai/aiService.js';
import { addProjectToSheet, updateProjectStatusInSheet } from './services/sheets/sheets.js';
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

app.use(cors(corsOptions));
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message
  });
});

// Rest of your server code remains the same...

const aiService = createAIService('gemini');

app.post('/api/process-project', async (req, res) => {
  try {
    const projectData = req.body;
    
    // Generate parts list
    const partsList = await aiService.generatePartsList(projectData.description);
    
    // Analyze project
    const analysis = await aiService.analyzeProject(projectData);
    
    res.json({
      success: true,
      partsList,
      analysis
    });
  } catch (error) {
    console.error('Error processing project:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process project'
    });
  }
});

app.post('/api/store-project', async (req, res) => {
  try {
    const projectData = req.body;
    const result = await addProjectToSheet(projectData, {
      partsList: projectData.partsList,
      analysis: projectData.analysis
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error storing project:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to store project'
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// server.js - Add these new endpoints

// Verify payment endpoint
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { transactionId } = req.body;
    
    // Here you would typically verify the payment with your payment provider
    // For now, we'll just simulate a successful verification
    const isValid = transactionId && transactionId.length > 5;
    
    if (!isValid) {
      throw new Error('Invalid transaction ID');
    }
    
    res.json({
      success: true,
      message: 'Payment verified successfully'
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to verify payment'
    });
  }
});

// Update project status endpoint
app.post('/api/update-project-status', async (req, res) => {
  try {
    const projectData = req.body;
    
    // Update the project status in your Google Sheet
    // You'll need to modify your sheets.js to handle this
    await updateProjectStatusInSheet(projectData);
    
    res.json({
      success: true,
      message: 'Project status updated successfully'
    });
  } catch (error) {
    console.error('Error updating project status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update project status'
    });
  }
});