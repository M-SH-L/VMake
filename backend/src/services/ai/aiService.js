// src/services/ai/aiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../../utils/logger.js';

class GeminiService {
  constructor(apiKey) {
    if (!apiKey) {
      logger.error('Gemini API key not provided');
      throw new Error('Gemini API key is required');
    }
    logger.info('Initializing Gemini Service...');
    
    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      logger.info('Gemini Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Gemini Service:', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  cleanJsonResponse(text) {
    try {
      logger.debug('Cleaning JSON response', { originalLength: text.length });
      
      // Remove markdown code blocks
      let cleaned = text.replace(/```json\n|```JSON\n|```\n|```/g, '');
      
      // Remove any leading/trailing whitespace
      cleaned = cleaned.trim();
      
      // Fix common JSON formatting issues
      cleaned = cleaned
        // Fix missing commas in arrays
        .replace(/"\n\s*"/g, '",\n"')
        // Fix any trailing commas
        .replace(/,(\s*[}\]])/g, '$1');
      
      logger.debug('Cleaned response:', cleaned);
      
      // Attempt to parse and validate JSON
      const parsed = JSON.parse(cleaned);
      
      // Validate required fields for analysis response
      if (parsed.challenges && !Array.isArray(parsed.challenges)) {
        throw new Error('Invalid challenges format');
      }
      if (parsed.recommendations && !Array.isArray(parsed.recommendations)) {
        throw new Error('Invalid recommendations format');
      }
      if (parsed.safetyConsiderations && !Array.isArray(parsed.safetyConsiderations)) {
        throw new Error('Invalid safetyConsiderations format');
      }
      if (parsed.prerequisiteKnowledge && !Array.isArray(parsed.prerequisiteKnowledge)) {
        throw new Error('Invalid prerequisiteKnowledge format');
      }

      logger.debug('JSON response cleaned and validated successfully');
      return parsed;
    } catch (error) {
      logger.error('Error cleaning JSON response:', {
        error: error.message,
        originalText: text
      });
      throw new Error(`Failed to clean and validate JSON response: ${error.message}`);
    }
  }

  async generatePartsList(projectDescription) {
    try {
      logger.info('Starting parts list generation', {
        descriptionLength: projectDescription.length
      });

      const prompt = `
        You are an electronics expert. Generate a detailed parts list for this project.
        Consider all necessary components including tools and accessories.
        Project Description: ${projectDescription}
        
        Respond with ONLY a JSON object with this structure:
        {
          "parts": [
            {
              "name": "part name",
              "quantity": number,
              "price": number,
              "description": "brief description",
              "optional": boolean
            }
          ],
          "totalCost": number,
          "additionalNotes": ["note1", "note2"]
        }
        
        IMPORTANT: Ensure all arrays have proper comma separation between items.
      `;

      logger.debug('Sending prompt to Gemini', { promptLength: prompt.length });

      const result = await this.model.generateContent(prompt);
      logger.debug('Received raw response from Gemini');
      
      const response = await result.response;
      const text = response.text();
      
      logger.debug('Processing response text', { responseLength: text.length });
      const parsedResponse = this.cleanJsonResponse(text);

      logger.info('Parts list generated successfully', {
        partsCount: parsedResponse.parts.length,
        totalCost: parsedResponse.totalCost
      });

      return parsedResponse;
    } catch (error) {
      logger.error('Failed to generate parts list:', {
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Parts list generation failed: ${error.message}`);
    }
  }

  async analyzeProject(projectData) {
    try {
      logger.info('Starting project analysis', {
        projectName: projectData.projectName
      });

      const prompt = `
        You are an electronics expert analyzing this project:
        Name: ${projectData.projectName}
        Description: ${projectData.description}
        Timeline: ${projectData.timeline || 'Not specified'}
        Budget: ${projectData.budget || 'Not specified'}
        
        Provide a JSON analysis. Remember to include commas between all array items.
        Required structure:
        {
          "feasibility": "HIGH|MEDIUM|LOW",
          "complexity": "BEGINNER|INTERMEDIATE|ADVANCED",
          "estimatedTime": "string",
          "challenges": [
            {
              "type": "TECHNICAL|SAFETY|IMPLEMENTATION",
              "description": "string"
            }
          ],
          "recommendations": [
            {
              "category": "SAFETY|IMPLEMENTATION|LEARNING",
              "description": "string"
            }
          ],
          "safetyConsiderations": [
            "consideration 1",
            "consideration 2",
            "consideration 3"
          ],
          "prerequisiteKnowledge": [
            "knowledge 1",
            "knowledge 2",
            "knowledge 3"
          ]
        }
        
        IMPORTANT: Ensure all arrays have proper comma separation between items.
      `;

      logger.debug('Sending analysis prompt to Gemini');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      logger.debug('Processing analysis response');
      const parsedResponse = this.cleanJsonResponse(text);

      logger.info('Project analysis completed successfully', {
        feasibility: parsedResponse.feasibility,
        complexity: parsedResponse.complexity
      });

      return parsedResponse;
    } catch (error) {
      logger.error('Project analysis failed:', {
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Project analysis failed: ${error.message}`);
    }
  }
}

export function createAIService(provider = 'gemini') {
  const apiKey = process.env.GEMINI_API_KEY;
  logger.info('Creating AI service', { provider });
  
  if (!apiKey) {
    logger.error('GEMINI_API_KEY not found in environment variables');
    throw new Error('GEMINI_API_KEY is not configured');
  }
  
  switch (provider) {
    case 'gemini':
      return new GeminiService(apiKey);
    default:
      logger.error('Unsupported AI provider specified', { provider });
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}