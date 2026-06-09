import mongoose from 'mongoose';

const salaryRangeSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
  },
  min: {
    type: Number,
    required: true,
  },
  max: {
    type: Number,
    required: true,
  },
  median: {
    type: Number,
    required: true,
  },
  location: String,
});

const industryInsightSchema = new mongoose.Schema(
  {
    industry: {
      type: String, // e.g. "tech-software-development"
      required: true,
      unique: true,
    },
    salaryRanges: {
      type: [salaryRangeSchema],
      default: [],
    },
    growthRate: {
      type: Number, // percentage growth
      default: 0,
    },
    demandLevel: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    topSkills: {
      type: [String],
      default: [],
    },
    marketOutlook: {
      type: String,
      enum: ['Positive', 'Neutral', 'Negative'],
      default: 'Neutral',
    },
    keyTrends: {
      type: [String],
      default: [],
    },
    recommendedSkills: {
      type: [String],
      default: [],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    nextUpdate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

industryInsightSchema.index({ industry: 1 });

const IndustryInsight = mongoose.model('IndustryInsight', industryInsightSchema);
export default IndustryInsight;
