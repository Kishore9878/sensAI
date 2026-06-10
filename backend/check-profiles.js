import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Profile from './models/Profile.js';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({});
    console.log(`Checking ${users.length} users...`);
    for (const u of users) {
      const profile = await Profile.findOne({ userId: u._id });
      console.log(`User: ${u.email}`);
      console.log(`- profileCompleted (User model): ${u.profileCompleted}`);
      console.log(`- Profile document exists: ${!!profile}`);
      if (u.profileCompleted && !profile) {
        console.log(`WARNING: Discrepancy! User is marked profileCompleted but has no profile document.`);
      }
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
};

run();
