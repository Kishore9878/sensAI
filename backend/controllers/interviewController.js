import InterviewSession from '../models/InterviewSession.js';
import Profile from '../models/Profile.js';
import { generateAIInterviewQuestions, evaluateAIInterviewAnswers } from '../services/aiService.js';

/**
 * @desc    Start new mock interview session
 * @route   POST /api/interview/start
 * @access  Private
 */
export const startInterviewSession = async (req, res, next) => {
  const { category } = req.body; // e.g. "Technical" or "Behavioral"

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

    // Call AI to generate interview questions
    const aiQuestions = await generateAIInterviewQuestions(
      profile.industry,
      profile.careerGoals || 'Professional Developer',
      category
    );

    // Create session in database
    const session = await InterviewSession.create({
      userId: req.user._id,
      quizScore: 0,
      category,
      questions: aiQuestions.map(q => ({
        question: q.question,
        options: q.options || [],
        answer: q.answer,
        userAnswer: '',
        feedback: q.feedback || '',
        isCorrect: false,
      })),
      improvementTip: '',
    });

    // Strip ideal answers before returning to prevent cheating
    const clientSession = session.toObject();
    clientSession.questions = clientSession.questions.map(q => {
      const { answer, ...rest } = q;
      return rest;
    });

    res.status(201).json(clientSession);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit answers for grading
 * @route   POST /api/interview/submit/:id
 * @access  Private
 */
export const submitInterviewAnswers = async (req, res, next) => {
  const { answers } = req.body; // Array of { questionId, userAnswer }

  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) {
      res.status(404);
      throw new Error('Session not found');
    }

    if (!answers || !Array.isArray(answers)) {
      res.status(400);
      throw new Error('Answers are required and must be an array');
    }

    // Grade multiple choice responses
    let correctCount = 0;
    session.questions.forEach(q => {
      const submitted = answers.find(a => a.questionId === q._id.toString());
      const userAns = submitted ? submitted.userAnswer : '';
      q.userAnswer = userAns;
      
      // Exact option string matching
      q.isCorrect = userAns.trim() === q.answer.trim();
      if (q.isCorrect) {
        correctCount++;
      }
    });

    const totalQuestions = session.questions.length;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    session.quizScore = score;

    // Define personalized feedback tips
    if (score >= 80) {
      session.improvementTip = "Excellent job! You have demonstrated strong mastery of these concepts. Keep practicing to maintain your edge.";
    } else if (score >= 50) {
      session.improvementTip = "Good effort! Focus on learning the broader React component lifecycle and how `useEffect` integrates with it. Practice using hooks in various lifecycle scenarios.";
    } else {
      session.improvementTip = "Focus on solidifying your understanding of core JavaScript concepts, asynchronous programming, and fundamental database and HTTP principles. Practice coding with React, Node.js, and SQL, focusing on common patterns and best practices.";
    }

    await session.save();
    res.json(session);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all interview sessions of current user
 * @route   GET /api/interview
 * @access  Private
 */
export const getInterviewSessions = async (req, res, next) => {
  try {
    const sessions = await InterviewSession.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single interview session
 * @route   GET /api/interview/:id
 * @access  Private
 */
export const getInterviewSessionById = async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) {
      res.status(404);
      throw new Error('Interview session not found');
    }
    res.json(session);
  } catch (error) {
    next(error);
  }
};
