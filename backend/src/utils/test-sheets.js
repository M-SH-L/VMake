// backend/src/test-sheets.js
import { addProjectToSheet, getProjectsFromSheet } from '../services/sheets/sheets.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Verify environment setup before running tests
console.log('\n=== Testing Environment Setup ===\n');

const envPath = path.join(__dirname, '../.env');
console.log('Looking for .env file at:', envPath);
console.log('.env file exists:', fs.existsSync(envPath) ? 'Yes' : 'No');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('ENV file content (sanitized):', envContent.replace(/=.*/g, '=****'));
}

async function testSheetConnection() {
  try {
    // Test project data
    const testProject = {
      name: "Test User",
      email: "test@example.com",
      phone: "1234567890",
      projectName: "Test Project",
      description: "This is a test project",
      timeline: "2 weeks",
      budget: "1000",
      location: "New York"
    };

    // Test parts list
    const testPartsList = {
      parts: [
        {
          name: "Test Part",
          quantity: 1,
          price: 100
        }
      ]
    };

    console.log('\n=== Running Sheet Tests ===\n');

    console.log('1. Testing addProjectToSheet...');
    const addResult = await addProjectToSheet(testProject, testPartsList);
    console.log('Add result:', addResult);

    console.log('\n2. Testing getProjectsFromSheet...');
    const projects = await getProjectsFromSheet();
    console.log('Fetched projects:', projects.length);

    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testSheetConnection();