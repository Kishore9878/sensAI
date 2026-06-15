import Profile from '../models/Profile.js';
import User from '../models/User.js';

/**
 * @desc    Get current user profile
 * @route   GET /api/profile
 * @access  Private
 */
export const getProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.json(null); // Return null so the frontend knows profile is not created
    }
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create or update user profile
 * @route   POST /api/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  const {
    bio,
    skills,
    experience,
    education,
    industry,
    linkedinUrl,
    githubUrl,
    resumeUrl,
    careerGoals,
    role,
  } = req.body;

  try {
    let profile = await Profile.findOne({ userId: req.user._id });

    const profileData = {
      userId: req.user._id,
      bio,
      skills: Array.isArray(skills) ? skills : skills ? skills.split(',').map(s => s.trim()) : [],
      experience: Number(experience) || 0,
      education: Array.isArray(education) ? education : [],
      industry,
      linkedinUrl,
      githubUrl,
      resumeUrl,
      careerGoals,
      role,
    };

    if (profile) {
      // Update existing profile
      profile = await Profile.findOneAndUpdate(
        { userId: req.user._id },
        { $set: profileData },
        { new: true }
      );
    } else {
      // Create new profile
      profile = await Profile.create(profileData);
    }

    // Mark user profile as completed
    await User.findByIdAndUpdate(req.user._id, { profileCompleted: true });

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};
