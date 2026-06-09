import mongoose from 'mongoose';

const coverLetterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String, // Markdown content
      required: true,
    },
    jobDescription: {
      type: String,
      default: '',
    },
    companyName: {
      type: String,
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'completed'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

// Add index to speed up fetching user's cover letters
coverLetterSchema.index({ userId: 1 });

const CoverLetter = mongoose.model('CoverLetter', coverLetterSchema);
export default CoverLetter;
