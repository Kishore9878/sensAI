import express from 'express';
import { getIndustryInsights } from '../controllers/insightController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:industry', protect, getIndustryInsights);

export default router;
