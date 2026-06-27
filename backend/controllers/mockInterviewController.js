import MockInterviewSession from '../models/MockInterviewSession.js';
import Profile from '../models/Profile.js';
import { 
  generateMockInterviewQuestion, 
  gradeMockInterviewAnswer, 
  generateMockInterviewFinalFeedback 
} from '../services/mockInterviewAIService.js';

// Number of questions in a mock interview
const MOCK_INTERVIEW_LENGTH = 5;

/**
 * @desc    Start new mock interview session and get first question
 * @route   POST /api/mock-interview/start
 * @access  Private
 */
export const startMockInterview = async (req, res, next) => {
  const { category, subject, resumeData } = req.body; // e.g. "technical", "behavioral", "system_design", "general"

  try {
    if (!category) {
      res.status(400);
      throw new Error('Please specify an interview category');
    }

    // Get user profile details
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      res.status(400);
      throw new Error('Please complete your profile first');
    }

    // Generate the first question using the AI service
    const firstQData = await generateMockInterviewQuestion(profile, category, [], subject, resumeData);
    
    // Create the session in the database
    const session = await MockInterviewSession.create({
      userId: req.user._id,
      category,
      subject: subject || '',
      resumeData: resumeData || null,
      status: 'active',
      questions: [{
        question: firstQData.question,
        userAnswer: '',
        voiceTranscript: '',
        feedback: '',
        scores: {
          technicalAccuracy: 0,
          communication: 0,
          problemSolving: 0,
          confidence: 0,
          completeness: 0,
          clarity: 0,
          overallQuality: 0
        }
      }]
    });

    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit answer to current question, get grading, and return next question OR final feedback
 * @route   POST /api/mock-interview/submit/:id
 * @access  Private
 */
export const submitMockInterviewAnswer = async (req, res, next) => {
  const { questionId, userAnswer, voiceTranscript, duration } = req.body;

  try {
    const session = await MockInterviewSession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) {
      res.status(404);
      throw new Error('Mock interview session not found');
    }

    if (session.status === 'completed') {
      res.status(400);
      throw new Error('This interview session is already completed');
    }

    // Find the question to grade
    const questionIndex = session.questions.findIndex(q => q._id.toString() === questionId);
    if (questionIndex === -1) {
      res.status(400);
      throw new Error('Question not found in this session');
    }

    const targetQuestion = session.questions[questionIndex];
    targetQuestion.userAnswer = userAnswer || '';
    targetQuestion.voiceTranscript = voiceTranscript || '';

    // Grade the answer immediately using the AI service
    const gradeData = await gradeMockInterviewAnswer(targetQuestion.question, targetQuestion.userAnswer);
    targetQuestion.feedback = gradeData.feedback;
    targetQuestion.scores = gradeData.scores;

    // Check if we need to generate another question
    if (session.questions.length < MOCK_INTERVIEW_LENGTH) {
      const profile = await Profile.findOne({ userId: req.user._id }) || {};
      
      // Generate next question
      const nextQData = await generateMockInterviewQuestion(profile, session.category, session.questions, session.subject, session.resumeData);
      
      // Add next question to session
      session.questions.push({
        question: nextQData.question,
        userAnswer: '',
        voiceTranscript: '',
        feedback: '',
        scores: {
          technicalAccuracy: 0,
          communication: 0,
          problemSolving: 0,
          confidence: 0,
          completeness: 0,
          clarity: 0,
          overallQuality: 0
        }
      });

      if (duration) {
        session.duration += duration;
      }
      
      await session.save();
      res.json({ session, finished: false });
    } else {
      // This was the last question! Execute final evaluation
      if (duration) {
        session.duration += duration;
      }

      // Compute aggregated category scores (average across all MOCK_INTERVIEW_LENGTH questions)
      const aggregates = {
        technicalAccuracy: 0,
        communication: 0,
        problemSolving: 0,
        confidence: 0,
        completeness: 0,
        clarity: 0,
        overallQuality: 0
      };

      session.questions.forEach(q => {
        aggregates.technicalAccuracy += q.scores.technicalAccuracy || 0;
        aggregates.communication += q.scores.communication || 0;
        aggregates.problemSolving += q.scores.problemSolving || 0;
        aggregates.confidence += q.scores.confidence || 0;
        aggregates.completeness += q.scores.completeness || 0;
        aggregates.clarity += q.scores.clarity || 0;
        aggregates.overallQuality += q.scores.overallQuality || 0;
      });

      const count = session.questions.length;
      session.categoryScores = {
        technicalAccuracy: Math.round((aggregates.technicalAccuracy / count) * 10) / 10,
        communication: Math.round((aggregates.communication / count) * 10) / 10,
        problemSolving: Math.round((aggregates.problemSolving / count) * 10) / 10,
        confidence: Math.round((aggregates.confidence / count) * 10) / 10,
        completeness: Math.round((aggregates.completeness / count) * 10) / 10,
        clarity: Math.round((aggregates.clarity / count) * 10) / 10,
        overallQuality: Math.round((aggregates.overallQuality / count) * 10) / 10
      };

      // Call AI to generate full report feedback
      const finalReport = await generateMockInterviewFinalFeedback(session.category, session.questions);
      
      session.performanceSummary = finalReport.performanceSummary;
      session.strengths = finalReport.strengths;
      session.improvements = finalReport.improvements;
      session.learningResources = finalReport.learningResources;
      session.recommendedNext = finalReport.recommendedNext;
      session.difficultyLevel = finalReport.difficultyLevel;
      session.readiness = finalReport.readiness;
      session.overallScore = finalReport.overallScore || 0;
      session.status = 'completed';

      await session.save();
      res.json({ session, finished: true });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all mock interview sessions of current user
 * @route   GET /api/mock-interview
 * @access  Private
 */
export const getMockInterviewSessions = async (req, res, next) => {
  const { category } = req.query;
  try {
    const filter = { userId: req.user._id };
    if (category) {
      filter.category = category;
    }
    const sessions = await MockInterviewSession.find(filter).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single mock interview session details
 * @route   GET /api/mock-interview/:id
 * @access  Private
 */
export const getMockInterviewSessionById = async (req, res, next) => {
  try {
    const session = await MockInterviewSession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) {
      res.status(404);
      throw new Error('Mock interview session not found');
    }
    res.json(session);
  } catch (error) {
    next(error);
  }
};
