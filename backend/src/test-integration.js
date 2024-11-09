// backend/src/test-integration.js
import { addProjectToSheet, getProjectsFromSheet } from './services/sheets/sheets.js';
import { createAIService } from './services/ai/aiService.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({
  path: path.join(__dirname, '../.env')
});

async function testIntegration() {
  try {
    console.log('\n=== Starting Integration Test ===\n');

    // Initialize AI Service
    console.log('1. Initializing AI Service...');
    const aiService = createAIService('gemini');
    console.log('✅ AI Service initialized');

    // Test project data
    const testProject = {
      name: "Test User",
      email: "test@example.com",
      phone: "1234567890",
      projectName: "Arduino Robot Arm",
      description: "Building a 3-axis robot arm using Arduino, servo motors, and 3D printed parts",
      timeline: "4 weeks",
      budget: "200",
      location: "New York"
    };

    // Generate parts list using AI
    console.log('\n2. Generating parts list...');
    const partsList = await aiService.generatePartsList(testProject.description);
    console.log('✅ Parts list generated:', JSON.stringify(partsList, null, 2));

    // Analyze project
    console.log('\n3. Analyzing project...');
    const analysis = await aiService.analyzeProject(testProject);
    console.log('✅ Project analysis completed:', JSON.stringify(analysis, null, 2));

    // Store in Google Sheets
    console.log('\n4. Storing in Google Sheets...');
    const sheetResult = await addProjectToSheet(testProject, {
      partsList,
      analysis
    });
    console.log('✅ Data stored in sheet');

    // Verify storage
    console.log('\n5. Verifying stored data...');
    const projects = await getProjectsFromSheet();
    const lastProject = projects[projects.length - 1];
    console.log('✅ Latest project retrieved:', lastProject);

    console.log('\n✅ All integration tests passed successfully!\n');
  } catch (error) {
    console.error('\n❌ Integration test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the integration test
testIntegration();