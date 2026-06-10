import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Profile from './models/Profile.js';
import { generateAIInterviewQuestions } from './services/aiService.js';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find a software development profile
    const profile = await Profile.findOne({ industry: 'tech-software-development' });
    console.log(`Testing with industry: ${profile.industry}`);
    
    console.log('\n--- SESSION 1 QUESTIONS ---');
    const q1 = await generateAIInterviewQuestions(profile.industry, 'Software Engineer', 'Technical');
    q1.forEach((q, idx) => console.log(`${idx + 1}. ${q.question}`));
    
    console.log('\n--- SESSION 2 QUESTIONS ---');
    const q2 = await generateAIInterviewQuestions(profile.industry, 'Software Engineer', 'Technical');
    q2.forEach((q, idx) => console.log(`${idx + 1}. ${q.question}`));
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
};

run();
