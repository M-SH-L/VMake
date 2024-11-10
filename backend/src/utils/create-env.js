// backend/src/create-env.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '../../.env');

// Replace this with your actual Google Sheet ID
const googleSheetId = '1MRgSW0k90YSIdJCfVUiw1l-3msINOrsXZ4Tun1164XU';

const envContent = `GOOGLE_SHEET_ID=${googleSheetId}`;

try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Successfully created .env file at:', envPath);
    console.log('Content written (sanitized):\nGOOGLE_SHEET_ID=****');
} catch (error) {
    console.error('❌ Error creating .env file:', error);
}