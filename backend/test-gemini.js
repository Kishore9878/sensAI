import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log('API Key length:', apiKey ? apiKey.length : 0);
console.log('API Key starts with:', apiKey ? apiKey.substring(0, 5) : 'none');

if (!apiKey) {
  console.error('No API key found!');
  process.exit(1);
}

try {
  const genAI = new GoogleGenerativeAI(apiKey);
  // Let's try gemini-1.5-flash since 2.5-flash might not be supported in older SDKs or might need correct naming
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  console.log('Sending test request to gemini-1.5-flash...');
  const result = await model.generateContent('Hello, are you there? Reply with "Yes".');
  console.log('gemini-1.5-flash response:', result.response.text());
} catch (error) {
  console.error('Error with gemini-1.5-flash:', error.message);
}

try {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  console.log('Sending test request to gemini-2.5-flash...');
  const result = await model.generateContent('Hello, are you there? Reply with "Yes".');
  console.log('gemini-2.5-flash response:', result.response.text());
} catch (error) {
  console.error('Error with gemini-2.5-flash:', error.message);
}
