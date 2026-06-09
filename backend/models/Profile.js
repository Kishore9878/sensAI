import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema({
  school: String,
  degree: String,
  fieldOfStudy: String,
  startYear: Number,
  endYear: Number,
});

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: Number, // Years of experience
      default: 0,
    },
    education: {
      type: [educationSchema],
      default: [],
    },
    industry: {
      type: String, // e.g. "tech-software-development"
      default: '',
    },
    linkedinUrl: {
      type: String,
      default: '',
    },
    githubUrl: {
      type: String,
      default: '',
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    careerGoals: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model('Profile', profileSchema);
export default Profile;
