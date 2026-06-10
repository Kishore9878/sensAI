import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

const testModel = async (modelName) => {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    console.log(`Testing model: ${modelName}...`);
    const result = await model.generateContent('Say hello');
    console.log(`- Success! Response: ${result.response.text().trim()}`);
    return true;
  } catch (err) {
    console.log(`- Failed: ${err.message}`);
    return false;
  }
};

const run = async () => {
  const models = [
    'gemini-pro',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.5-flash',
    'gemini-2.5-pro'
  ];
  for (const m of models) {
    await testModel(m);
  }
};

run();
