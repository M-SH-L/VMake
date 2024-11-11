// env-check.js
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const currentDir = process.cwd();

console.log('Current Directory:', currentDir);

// Check .env file
const envPath = path.join(currentDir, '.env');
console.log('\n1. Checking .env file at:', envPath);
if (fs.existsSync(envPath)) {
    console.log('✅ .env file found');
    const content = fs.readFileSync(envPath, 'utf8');
    console.log('File content length:', content.length);
    
    // Check file permissions
    const stats = fs.statSync(envPath);
    console.log('File permissions:', stats.mode.toString(8));
} else {
    console.log('❌ .env file not found');
    console.log('Available files in directory:');
    console.log(fs.readdirSync(currentDir)
        .filter(file => !file.startsWith('.git'))
        .join('\n'));
}

// Try to load environment variables
try {
    const result = dotenv.config();
    console.log('\n2. Loading environment variables:');
    if (result.error) {
        console.log('❌ Error:', result.error.message);
    } else {
        console.log('✅ Environment variables loaded');
    }
} catch (error) {
    console.log('❌ Error loading variables:', error.message);
}

// Check specific variables
console.log('\n3. Environment Variables Check:');
const requiredVars = [
    'GEMINI_API_KEY',
    'PORT',
    'GOOGLE_SHEET_ID',
    'NODE_ENV',
    'CORS_ORIGIN'
];

requiredVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅ Set' : '❌ Not Set';
    // For sensitive values, don't show the actual value
    const displayValue = varName.includes('KEY') || varName.includes('ID') ? 
        (value ? '(Present)' : 'Not Found') : 
        value || 'Not Found';
    console.log(`${varName}: ${status} - ${displayValue}`);
});

// Print file system info
console.log('\n4. File System Check:');
try {
    const files = fs.readdirSync(currentDir);
    console.log('Files in directory:');
    files.forEach(file => {
        if (!file.startsWith('.git')) {
            const stats = fs.statSync(path.join(currentDir, file));
            console.log(`- ${file} (${stats.isDirectory() ? 'directory' : 'file'})`);
        }
    });
} catch (error) {
    console.log('Error reading directory:', error.message);
}