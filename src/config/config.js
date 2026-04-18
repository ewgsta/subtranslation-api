import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
  apiKey: process.env.API_KEY,
  model: process.env.MODEL_NAME || 'google/gemma-3-27b-it:free',
  maxFileSize: 5 * 1024 * 1024,
  allowedFormats: ['srt', 'vtt'],
  corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [
    'http://localhost:3000',
    'https://aiceviri.ewgsta.me',
    'https://translation-api.vercel.app'
  ]
};
