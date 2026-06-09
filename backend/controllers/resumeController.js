import Resume from '../models/Resume.js';
import Profile from '../models/Profile.js';
import { generateAIResumeAndATS, improveResumeDescription } from '../services/aiService.js';

/**
 * @desc    Get user's resume
 * @route   GET /api/resume
 * @access  Private
 */
export const getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.json(resume);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate/Optimize resume and ATS score using AI
 * @route   POST /api/resume/generate
 * @access  Private
 */
export const generateResume = async (req, res, next) => {
  const { existingResumeText } = req.body;

  try {
    // Fetch profile to feed into AI
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      res.status(400);
      throw new Error('Please complete your profile first');
    }

    // Call AI to generate/optimize
    const aiResult = await generateAIResumeAndATS(profile, profile.careerGoals, existingResumeText || '');

    // Save or update in database
    let resume = await Resume.findOne({ userId: req.user._id });

    if (resume) {
      resume.content = aiResult.content;
      resume.atsScore = aiResult.atsScore;
      resume.feedback = aiResult.feedback;
      await resume.save();
    } else {
      resume = await Resume.create({
        userId: req.user._id,
        content: aiResult.content,
        atsScore: aiResult.atsScore,
        feedback: aiResult.feedback,
      });
    }

    res.status(200).json(resume);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save/Update resume markdown manually
 * @route   PUT /api/resume
 * @access  Private
 */
export const updateResume = async (req, res, next) => {
  const { content, atsScore, feedback } = req.body;

  try {
    let resume = await Resume.findOne({ userId: req.user._id });

    if (resume) {
      resume.content = content;
      if (atsScore !== undefined) resume.atsScore = atsScore;
      if (feedback !== undefined) resume.feedback = feedback;
      await resume.save();
    } else {
      resume = await Resume.create({
        userId: req.user._id,
        content,
        atsScore: atsScore || 0,
        feedback: feedback || '',
      });
    }

    res.json(resume);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Improve a resume description/bullet point using AI
 * @route   POST /api/resume/improve
 * @access  Private
 */
export const improveDescription = async (req, res, next) => {
  const { description, industry } = req.body;

  try {
    if (!description) {
      res.status(400);
      throw new Error('Please provide a description to improve');
    }

    const improved = await improveResumeDescription(description, industry || '');
    res.json({ improved });
  } catch (error) {
    next(error);
  }
};

