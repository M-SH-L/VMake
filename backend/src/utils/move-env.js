// backend/src/move-env.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootEnvPath = path.join(__dirname, '../../.env');
const backendEnvPath = path.join(__dirname, '../../backend/.env');

try {
    // Read root .env if it exists
    if (fs.existsSync(rootEnvPath)) {
        const envContent = fs.readFileSync(rootEnvPath, 'utf8');
        
        // Write to backend .env
        fs.writeFileSync(backendEnvPath, envContent);
        console.log('✅ Successfully copied .env content to backend directory');
        
        // Delete root .env
        fs.unlinkSync(rootEnvPath);
        console.log('✅ Deleted root .env file');
    }
    
    console.log('📁 Current .env location:', backendEnvPath);
    console.log('Content written (sanitized):\nGOOGLE_SHEET_ID=****');
} catch (error) {
    console.error('❌ Error moving .env file:', error);
}