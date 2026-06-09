import express from 'express';
import { registerUser, loginUser, getUserMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getUserMe);

export default router;
