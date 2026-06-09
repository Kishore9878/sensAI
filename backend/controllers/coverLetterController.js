import CoverLetter from '../models/CoverLetter.js';
import Profile from '../models/Profile.js';
import { generateAICoverLetter } from '../services/aiService.js';

/**
 * @desc    Get all user's cover letters
 * @route   GET /api/coverletter
 * @access  Private
 */
export const getCoverLetters = async (req, res, next) => {
  try {
    const letters = await CoverLetter.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(letters);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single cover letter
 * @route   GET /api/coverletter/:id
 * @access  Private
 */
export const getCoverLetterById = async (req, res, next) => {
  try {
    const letter = await CoverLetter.findOne({ _id: req.params.id, userId: req.user._id });
    if (!letter) {
      res.status(404);
      throw new Error('Cover letter not found');
    }
    res.json(letter);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate tailored cover letter using AI
 * @route   POST /api/coverletter/generate
 * @access  Private
 */
export const generateCoverLetter = async (req, res, next) => {
  const { jobDescription, companyName, jobTitle } = req.body;

  try {
    if (!companyName || !jobTitle) {
      res.status(400);
      throw new Error('Please enter company name and job title');
    }

    // Fetch user profile
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      res.status(400);
      throw new Error('Please complete your profile first');
    }

    // Call AI to generate letter
    const content = await generateAICoverLetter(profile, jobDescription || '', companyName, jobTitle);

    // Save to database
    const letter = await CoverLetter.create({
      userId: req.user._id,
      content,
      jobDescription,
      companyName,
      jobTitle,
      status: 'draft',
    });

    res.status(201).json(letter);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update cover letter content
 * @route   PUT /api/coverletter/:id
 * @access  Private
 */
export const updateCoverLetter = async (req, res, next) => {
  const { content, status } = req.body;

  try {
    let letter = await CoverLetter.findOne({ _id: req.params.id, userId: req.user._id });

    if (!letter) {
      res.status(404);
      throw new Error('Cover letter not found');
    }

    letter.content = content || letter.content;
    if (status) letter.status = status;

    await letter.save();
    res.json(letter);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete cover letter
 * @route   DELETE /api/coverletter/:id
 * @access  Private
 */
export const deleteCoverLetter = async (req, res, next) => {
  try {
    const letter = await CoverLetter.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!letter) {
      res.status(404);
      throw new Error('Cover letter not found');
    }
    res.json({ message: 'Cover letter removed' });
  } catch (error) {
    next(error);
  }
};
