import dotenv from 'dotenv';
import mongoose from 'mongoose';
import CoverLetter from './models/CoverLetter.js';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const letters = await CoverLetter.find({}).sort({ createdAt: -1 }).limit(10);
    console.log(`Latest ${letters.length} cover letters:`);
    for (const l of letters) {
      console.log(`- ID: ${l._id}, User: ${l.userId}, Job: ${l.jobTitle} at ${l.companyName}, Created: ${l.createdAt}`);
      console.log(`  Content length: ${l.content ? l.content.length : 0}`);
      if (l.content) {
        console.log(`  Content preview: ${l.content.substring(0, 100)}...`);
      }
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
};

run();
