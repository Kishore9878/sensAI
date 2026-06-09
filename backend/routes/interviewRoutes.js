import express from 'express';
import {
  startInterviewSession,
  submitInterviewAnswers,
  getInterviewSessions,
  getInterviewSessionById,
} from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getInterviewSessions);

router.post('/start', protect, startInterviewSession);
router.post('/submit/:id', protect, submitInterviewAnswers);
router.get('/:id', protect, getInterviewSessionById);

export default router;
