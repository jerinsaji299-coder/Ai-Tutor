import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import Plan from "./models/Plan.js";
import planningRoutes from "./routes/planning.js";
import hybridPlanningRoutes from "./routes/hybridPlanning.js";
import adaptiveLearningRoutes from "./routes/adaptiveLearning.js";
import youtubeEnhancementRoutes from "./routes/youtubeEnhancement.js";
import authRoutes from "./routes/auth.js";
import connectDB from "./config/database.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Rate limiting for hackathon demo (generous limits)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api', limiter);

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI;
if (mongoURI && mongoURI !== 'mongodb://localhost:27017/ai-tutor' && !mongoURI.includes('username:password') && !mongoURI.includes('<db_password>')) {
  console.log('🔄 Attempting to connect to MongoDB...');
  connectDB();
} else if (mongoURI && mongoURI.includes('localhost')) {
  console.log('🔄 Attempting to connect to local MongoDB...');
  connectDB();
} else {
  console.log('📝 MongoDB not configured - app running in AI-only mode');
  if (process.env.MONGODB_OPTIONAL === 'true') {
    console.log('⚠️  Authentication features will be disabled without MongoDB');
  }
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/planning', planningRoutes);
app.use('/api/hybrid', hybridPlanningRoutes);
app.use('/api/adaptive', adaptiveLearningRoutes);
app.use('/api/youtube', youtubeEnhancementRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Tutor Backend is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AI Tutor Backend running on port ${PORT}`);
  console.log(`📊 Health check available at: http://localhost:${PORT}/health`);
});

export default app;