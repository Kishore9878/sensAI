import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Resume from './models/Resume.js';
import User from './models/User.js';

dotenv.config();

const checkResumes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const resumes = await Resume.find({});
    console.log(`\n--- Found ${resumes.length} Total Resume Documents ---`);

    for (const r of resumes) {
      const user = await User.findById(r.userId);
      console.log(`Resume ID: ${r._id}`);
      console.log(`- User: ${user ? user.email : 'Unknown'} (ID: ${r.userId})`);
      console.log(`- ATS Score: ${r.atsScore}`);
      console.log(`- Created At: ${r.createdAt}`);
      console.log(`- Updated At: ${r.updatedAt}`);
      console.log(`- Content Length: ${r.content ? r.content.length : 0} chars`);
      console.log(`----------------------------------------`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error checking resumes:', err);
    process.exit(1);
  }
};

checkResumes();
