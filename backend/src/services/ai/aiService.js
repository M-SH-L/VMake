import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../../utils/logger.js';

class GeminiService {
  constructor(apiKey) {
    if (!apiKey) {
      logger.error('Missing API key');
      throw new Error('Gemini API key is required');
    }
    
    logger.info('Initializing Gemini service');
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    logger.info('Gemini service initialized');
  }

  async generatePartsList(projectDescription) {
    try {
      logger.info('Starting parts list generation');
      logger.info('Project description:', projectDescription);

      const prompt = `
        Generate a parts list for this electronics project. 
        Project: ${projectDescription}
        
        Respond ONLY with a JSON object in this exact format:
        {
          "parts": [
            {
              "name": "Component name",
              "quantity": number,
              "price": number,
              "description": "Component purpose",
              "optional": boolean
            }
          ],
          "totalCost": number,
          "additionalNotes": ["note1", "note2"]
        }`;

      logger.info('Sending request to Gemini');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      logger.info('Received response from Gemini');
      logger.info('Raw response:', text);

      const parsedResponse = JSON.parse(text);
      logger.info('Successfully parsed response');
      
      return parsedResponse;
    } catch (error) {
      logger.error('Error in generatePartsList:', error);
      throw new Error(`Parts list generation failed: ${error.message}`);
    }
  }

  async analyzeProject(projectData) {
    try {
      logger.info('Starting project analysis');
      logger.info('Project data:', projectData);

      const prompt = `
        Analyze this electronics project and provide insights.
        Project: ${JSON.stringify(projectData)}
        
        Respond ONLY with a JSON object in this exact format:
        {
          "feasibility": "HIGH|MEDIUM|LOW",
          "complexity": "BEGINNER|INTERMEDIATE|ADVANCED",
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
          ],
          "safetyConsiderations": [
            "string"
          ]
        }`;

      logger.info('Sending request to Gemini');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      logger.info('Received response from Gemini');
      logger.info('Raw response:', text);

      const parsedResponse = JSON.parse(text);
      logger.info('Successfully parsed response');
      
      return parsedResponse;
    } catch (error) {
      logger.error('Error in analyzeProject:', error);
      throw new Error(`Project analysis failed: ${error.message}`);
    }
  }
}

export function createAIService(provider = 'gemini') {
  try {
    logger.info('Creating AI service');
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    switch (provider) {
      case 'gemini':
        return new GeminiService(apiKey);
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  } catch (error) {
    logger.error('Error creating AI service:', error);
    throw error;
  }
}