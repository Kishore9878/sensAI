import express from 'express';
import {
  getCoverLetters,
  getCoverLetterById,
  generateCoverLetter,
  updateCoverLetter,
  deleteCoverLetter,
} from '../controllers/coverLetterController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getCoverLetters);

router.post('/generate', protect, generateCoverLetter);

router.route('/:id')
  .get(protect, getCoverLetterById)
  .put(protect, updateCoverLetter)
  .delete(protect, deleteCoverLetter);

export default router;
