import dotenv from 'dotenv';
import { improveResumeDescription } from './services/aiService.js';

dotenv.config();

console.log('Testing improveResumeDescription...');
const result = await improveResumeDescription('Worked on login form and user management.', 'Software Engineering');
console.log('Result:', result);
