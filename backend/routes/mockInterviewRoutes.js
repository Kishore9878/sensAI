import express from 'express';
import {
  startMockInterview,
  submitMockInterviewAnswer,
  getMockInterviewSessions,
  getMockInterviewSessionById
} from '../controllers/mockInterviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getMockInterviewSessions);

router.post('/start', protect, startMockInterview);
router.post('/submit/:id', protect, submitMockInterviewAnswer);
router.get('/:id', protect, getMockInterviewSessionById);

export default router;
