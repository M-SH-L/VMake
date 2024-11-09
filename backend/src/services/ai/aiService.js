// src/services/ai/aiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    console.log('Initializing Gemini Service...');
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  cleanJsonResponse(text) {
    // Remove markdown code blocks and any extra whitespace
    const cleaned = text.replace(/```json|```JSON|```/g, '').trim();
    return cleaned;
  }

  async generatePartsList(projectDescription) {
    try {
      console.log('Starting parts list generation...');
      const prompt = `
        You are an electronics expert. Generate a detailed parts list for this project.
        Consider all necessary components including tools and accessories.
        Respond with ONLY the JSON data, no markdown formatting or additional text.
        Project: ${projectDescription}
        
        The response should be a JSON object with this structure:
        {
          "parts": [
            {
              "name": "part name",
              "quantity": number,
              "price": number,
              "description": "brief description of part's purpose",
              "optional": boolean
            }
          ],
          "totalCost": number,
          "additionalNotes": [
            "note about parts compatibility",
            "note about quality considerations",
            "note about alternatives"
          ]
        }
      `;

      console.log('Sending request to Gemini...');
      const result = await this.model.generateContent(prompt);
      console.log('Received response from Gemini');
      
      const response = await result.response;
      const text = response.text();
      console.log('Raw Gemini response:', text);
      
      // Clean the response before parsing
      const cleanedResponse = this.cleanJsonResponse(text);
      console.log('Cleaned response:', cleanedResponse);
      
      try {
        const parsedResponse = JSON.parse(cleanedResponse);
        console.log('Successfully parsed JSON response');
        return parsedResponse;
      } catch (parseError) {
        console.error('Failed to parse cleaned response as JSON:', parseError);
        throw new Error('Invalid response format from AI');
      }
    } catch (error) {
      console.error('Detailed error in generatePartsList:', error);
      throw new Error(`Failed to generate parts list: ${error.message}`);
    }
  }

  async analyzeProject(projectData) {
    try {
      console.log('Starting enhanced project analysis...');
      const prompt = `
        You are an experienced electronics and robotics expert. Analyze this project and provide detailed, specific insights.
        Focus on practical challenges, safety considerations, and specific recommendations.
        
        Project Details:
        Name: ${projectData.projectName}
        Description: ${projectData.description}
        Timeline: ${projectData.timeline || 'Not specified'}
        Budget: ${projectData.budget || 'Not specified'}
        Experience Level: ${projectData.experience || 'Not specified'}
        
        Consider these aspects in your analysis:
        1. Technical feasibility given the timeline and experience level
        2. Specific technical challenges that might arise
        3. Required tools and workspace considerations
        4. Safety precautions for working with electronics
        5. Essential skills needed for successful completion
        6. Common mistakes to avoid
        7. Detailed cost breakdown considerations
        
        Return JSON in this format (provide detailed, specific responses for each field):
        {
          "feasibility": "HIGH|MEDIUM|LOW",
          "estimatedTime": "duration",
          "complexity": "BEGINNER|INTERMEDIATE|ADVANCED",
          "challenges": [
            {
              "type": "TECHNICAL",
              "description": "Detailed technical challenge description"
            },
            {
              "type": "SAFETY",
              "description": "Specific safety concern"
            },
            {
              "type": "IMPLEMENTATION",
              "description": "Specific implementation challenge"
            }
          ],
          "recommendations": [
            {
              "category": "SAFETY",
              "description": "Specific safety recommendation"
            },
            {
              "category": "IMPLEMENTATION",
              "description": "Specific implementation advice"
            },
            {
              "category": "LEARNING",
              "description": "Specific learning resource or tip"
            }
          ],
          "safetyConsiderations": [
            "Specific safety consideration about power management",
            "Specific safety consideration about component handling",
            "Specific safety consideration about workspace setup"
          ],
          "prerequisiteKnowledge": [
            "Specific required electronics concept",
            "Specific required programming concept",
            "Specific required tool proficiency"
          ],
          "estimatedCost": {
            "min": number,
            "max": number,
            "currency": "USD"
          }
        }

        Important: Provide at least 3 specific items for challenges, recommendations, safetyConsiderations, and prerequisiteKnowledge.
        Make all descriptions detailed and specific to this exact project.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedResponse = this.cleanJsonResponse(text);
      
      try {
        const parsedResponse = JSON.parse(cleanedResponse);
        console.log('Successfully generated enhanced analysis');
        return parsedResponse;
      } catch (parseError) {
        console.error('Failed to parse analysis response:', parseError);
        throw new Error('Invalid analysis response format');
      }
    } catch (error) {
      console.error('Error in enhanced project analysis:', error);
      throw new Error(`Failed to analyze project: ${error.message}`);
    }
  }
}

export function createAIService(provider = 'gemini') {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Creating AI service with provider:', provider);
  
  switch (provider) {
    case 'gemini':
      return new GeminiService(apiKey);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}