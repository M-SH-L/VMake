// test-server.js
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Use CORS middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit!');
  res.json({ message: 'Test successful!' });
});

// Start server
const port = 3001;
app.listen(port, () => {
  console.log(`Test server running on http://localhost:${port}`);
  console.log(`Try accessing: http://localhost:${port}/api/test`);
});