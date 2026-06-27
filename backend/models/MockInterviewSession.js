import mongoose from 'mongoose';

const mockQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  userAnswer: {
    type: String,
    default: '',
  },
  voiceTranscript: {
    type: String,
    default: '',
  },
  feedback: {
    type: String,
    default: '',
  },
  scores: {
    technicalAccuracy: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    problemSolving: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    completeness: { type: Number, default: 0 },
    clarity: { type: Number, default: 0 },
    overallQuality: { type: Number, default: 0 }
  }
});

const mockInterviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String, // 'technical', 'behavioral', 'system_design', 'general'
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
    },
    questions: {
      type: [mockQuestionSchema],
      default: [],
    },
    overallScore: {
      type: Number,
      default: 0,
    },
    categoryScores: {
      technicalAccuracy: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      problemSolving: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
      completeness: { type: Number, default: 0 },
      clarity: { type: Number, default: 0 },
      overallQuality: { type: Number, default: 0 }
    },
    performanceSummary: {
      type: String,
      default: '',
    },
    strengths: {
      type: [String],
      default: [],
    },
    improvements: {
      type: [String],
      default: [],
    },
    learningResources: {
      type: [String],
      default: [],
    },
    recommendedNext: {
      type: String,
      default: '',
    },
    difficultyLevel: {
      type: String,
      default: 'Intermediate',
    },
    readiness: {
      type: String,
      default: 'Not Ready',
    },
    duration: {
      type: Number, // in seconds
      default: 0,
    },
    subject: {
      type: String,
      default: '',
    },
    resumeData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    }
  },
  {
    timestamps: true,
  }
);

mockInterviewSessionSchema.index({ userId: 1 });

const MockInterviewSession = mongoose.model('MockInterviewSession', mockInterviewSessionSchema);
export default MockInterviewSession;
