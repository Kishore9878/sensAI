import express from 'express';
import multer from 'multer';
import { uploadAndParseResume } from '../controllers/resumeUploadController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Set up memory storage for multer file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // limit to 5MB
});

router.post('/upload-parse', protect, upload.single('resume'), uploadAndParseResume);

export default router;
