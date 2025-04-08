import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
// Try multiple locations for the .env file
const envPaths = [
  path.resolve(__dirname, '.env'),           // lib/.env
  path.resolve(__dirname, '../.env'),        // Root .env
  path.resolve(__dirname, '../../src/.env'), // For when running from lib but .env is in src
  path.resolve(__dirname, '../src/.env')     // For when running from root but .env is in src
];

// Try each path until we find one that works
let envLoaded = false;
for (const envPath of envPaths) {
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    console.log(`Loaded environment from: ${envPath}`);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn('Warning: No .env file found. Using environment variables only.');
}

export const config = {
  projectId: process.env.PROJECT_ID || '',
  location: process.env.LOCATION || 'us-central1',
  modelName: process.env.MODEL_NAME || 'gemini-1.5-pro',
  publisher: process.env.PUBLISHER || 'google',
  temperature: Number(process.env.TEMPERATURE || '0.2'),
  maxOutputTokens: Number(process.env.MAX_OUTPUT_TOKENS || '1024'),
};

// Validate essential configuration
if (!config.projectId) {
  throw new Error('PROJECT_ID environment variable is required');
}
