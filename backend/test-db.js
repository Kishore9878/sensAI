import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Profile from './models/Profile.js';
import CoverLetter from './models/CoverLetter.js';
import { generateAICoverLetter } from './services/aiService.js';

dotenv.config();

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log(`Found ${users.length} users:`);
    for (const u of users) {
      console.log(`- User: ${u.email}, ID: ${u._id}, profileCompleted: ${u.profileCompleted}`);
    }

    const profiles = await Profile.find({});
    console.log(`Found ${profiles.length} profiles:`);
    for (const p of profiles) {
      console.log(`- Profile for User ID: ${p.userId}, Skills: ${p.skills}, Experience: ${p.experience}`);
    }

    if (profiles.length > 0) {
      const profile = profiles[0];
      console.log('Testing generation with profile:', profile);
      const content = await generateAICoverLetter(profile, 'Test job description', 'Test Company', 'Software Engineer');
      console.log('Generated Content successfully!');
      console.log(content.substring(0, 100) + '...');
    } else {
      console.log('No profiles found in DB.');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Test failed with error:', err);
    process.exit(1);
  }
};

test();
