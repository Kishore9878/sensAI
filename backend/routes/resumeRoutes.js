import express from 'express';
import { getResume, generateResume, updateResume, improveDescription } from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getResume)
  .put(protect, updateResume);

router.post('/generate', protect, generateResume);
router.post('/improve', protect, improveDescription);

export default router;
