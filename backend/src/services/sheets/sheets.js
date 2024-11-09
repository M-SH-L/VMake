// backend/src/services/sheets/sheets.js
import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find the .env file in the backend directory
const envPath = path.join(__dirname, '../../../.env');

// Load environment variables
if (!fs.existsSync(envPath)) {
  throw new Error(`.env file not found at ${envPath}`);
}

const result = dotenv.config({ path: envPath });
if (result.error) {
  throw new Error(`Error loading .env file: ${result.error.message}`);
}

// Verify environment variables
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
if (!SHEET_ID) {
  console.error('Available environment variables:', Object.keys(process.env));
  throw new Error('GOOGLE_SHEET_ID is not defined in environment variables. Check your .env file.');
}

async function getAuthClient() {
  try {
    const credentialsPath = path.join(__dirname, '../../../credentials.json');
    
    if (!fs.existsSync(credentialsPath)) {
      throw new Error(`credentials.json not found at ${credentialsPath}`);
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    return auth;
  } catch (error) {
    console.error('Error initializing Google Auth:', error);
    throw new Error(`Failed to initialize Google Sheets authentication: ${error.message}`);
  }
}

export async function addProjectToSheet(projectData, partsList = null) {
  try {
    console.log('Starting to add project to sheet:', { projectData });
    console.log('Using Sheet ID:', SHEET_ID);
    
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    
    const row = [
      new Date().toISOString(),
      projectData.name || '',
      projectData.email || '',
      projectData.phone || '',
      projectData.projectName || '',
      projectData.description || '',
      projectData.timeline || '',
      projectData.budget || '',
      projectData.location || '',
      JSON.stringify(partsList) || ''
    ];

    console.log('Formatted row data:', row);
    
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:J',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row]
      }
    });

    console.log('Successfully added to sheet:', response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error adding project to sheet:', error);
    throw new Error(`Failed to add project to sheet: ${error.message}`);
  }
}

export async function getProjectsFromSheet() {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:J'
    });

    const rows = response.data.values || [];
    
    const projects = rows.slice(1).map(row => ({
      timestamp: row[0],
      name: row[1],
      email: row[2],
      phone: row[3],
      projectName: row[4],
      description: row[5],
      timeline: row[6],
      budget: row[7],
      location: row[8],
      partsList: row[9] ? JSON.parse(row[9]) : null
    }));

    return projects;
  } catch (error) {
    console.error('Error fetching projects from sheet:', error);
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }
}

// sheets.js - Add this new function

export async function updateProjectStatusInSheet(projectData) {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Find the project row by email or other unique identifier
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:J'
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[2] === projectData.email); // Assuming email is in column C

    if (rowIndex === -1) {
      throw new Error('Project not found');
    }

    // Update the status and payment information
    // Assuming you want to add these in new columns
    const updateRange = `Sheet1!K${rowIndex + 1}:M${rowIndex + 1}`;
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: updateRange,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          projectData.serviceType,
          projectData.transactionId,
          projectData.status
        ]]
      }
    });

    return {
      success: true,
      message: 'Project status updated successfully'
    };
  } catch (error) {
    console.error('Error updating project status in sheet:', error);
    throw new Error(`Failed to update project status: ${error.message}`);
  }
}