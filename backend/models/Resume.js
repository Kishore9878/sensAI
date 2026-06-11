import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: String,
  employmentType: {
    type: String,
    enum: ['Full Time', 'Part Time', 'Internship', 'Freelance', 'Contract']
  },
  startDate: String,
  endDate: String,
  current: { type: Boolean, default: false },
  technologies: [String],
  description: String
});

const educationSchema = new mongoose.Schema({
  school: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: String,
  cgpa: String,
  startDate: String,
  endDate: String,
  current: { type: Boolean, default: false },
  description: String
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [String],
  highlights: [String],
  github: String,
  live: String,
  startDate: String,
  endDate: String,
  role: String
});

const contactInfoSchema = new mongoose.Schema({
  email: String,
  mobile: String,
  linkedin: String,
  twitter: String,
  github: String,
  portfolio: String
});

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One resume per user
    },
    content: {
      type: String, // Markdown content
      required: true,
    },
    atsScore: {
      type: Number,
      default: 0,
    },
    feedback: {
      type: String,
      default: '',
    },
    contactInfo: contactInfoSchema,
    summary: String,
    skills: String,
    experiences: [experienceSchema],
    educations: [educationSchema],
    projects: [projectSchema]
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;
