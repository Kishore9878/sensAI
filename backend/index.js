import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import coverLetterRoutes from './routes/coverLetterRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import insightRoutes from './routes/insightRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/coverletter', coverLetterRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/insights', insightRoutes);

// Base Route
app.get('/', (req, res) => {
  res.json({ message: 'SensAI API is running...' });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
