import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Basic middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ status: 'OK' });
});

// Process project endpoint
app.post('/api/process-project', async (req, res) => {
  try {
    console.log('Processing project request:', req.body);
    
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Description is required' 
      });
    }

    // Generate parts list
    const partsPrompt = `
      Create a parts list for this electronics project: "${description}"
      Respond with only a JSON object in this format:
      {
        "parts": [
          {
            "name": "string",
            "quantity": number,
            "price": number,
            "description": "string",
            "optional": boolean
          }
        ],
        "totalCost": number,
        "additionalNotes": ["string"]
      }
    `;

    console.log('Generating parts list...');
    const partsResult = await model.generateContent(partsPrompt);
    const partsText = (await partsResult.response).text();
    console.log('Parts list response:', partsText);
    const partsList = JSON.parse(partsText);

    // Generate analysis
    const analysisPrompt = `
      Analyze this electronics project: "${description}"
      Respond with only a JSON object in this format:
      {
        "feasibility": "HIGH",
        "complexity": "BEGINNER",
        "estimatedTime": "string",
        "challenges": [
          {
            "type": "string",
            "description": "string"
          }
        ],
        "recommendations": [
          {
            "category": "string",
            "description": "string"
          }
        ]
      }
    `;

    console.log('Generating analysis...');
    const analysisResult = await model.generateContent(analysisPrompt);
    const analysisText = (await analysisResult.response).text();
    console.log('Analysis response:', analysisText);
    const analysis = JSON.parse(analysisText);

    res.json({
      success: true,
      partsList,
      analysis
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Gemini API Key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
});