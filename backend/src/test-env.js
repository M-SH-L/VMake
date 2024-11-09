// backend/src/test-env.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Update path to look in backend directory
const envPath = path.join(__dirname, '../../backend/.env');

console.log('\n=== Environment Debug ===\n');

// 1. Check file existence and content
console.log('1. ENV File Check:');
console.log(`   Path: ${envPath}`);
if (fs.existsSync(envPath)) {
    console.log('   ✅ .env file exists');
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('   File content (sanitized):');
    console.log('   ' + envContent.replace(/=.*/g, '=****'));
} else {
    console.log('   ❌ .env file not found');
}

// 2. Try loading environment variables
const envResult = dotenv.config({ path: envPath });
console.log('\n2. Loading ENV Variables:');
if (envResult.error) {
    console.log('   ❌ Error loading .env file:', envResult.error.message);
} else {
    console.log('   ✅ .env file loaded successfully');
}

// 3. Check environment variables
console.log('\n3. Environment Variables Status:');
console.log('   GOOGLE_SHEET_ID:', process.env.GOOGLE_SHEET_ID ? '✅ Set' : '❌ Not Set');
if (process.env.GOOGLE_SHEET_ID) {
    console.log('   Value length:', process.env.GOOGLE_SHEET_ID.length, 'characters');
    console.log('   First 4 chars:', process.env.GOOGLE_SHEET_ID.substring(0, 4) + '...');
}

console.log('\n=== End Debug ===\n');