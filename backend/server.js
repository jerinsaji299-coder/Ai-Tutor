import dotenv from "dotenv";

// Load environment variables FIRST before any other imports
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import Plan from "./models/Plan.js";
import User from "./models/User.js";
import planningRoutes from "./routes/planning.js";
import hybridPlanningRoutes from "./routes/hybridPlanning.js";
import adaptiveLearningRoutes from "./routes/adaptiveLearning.js";
import youtubeEnhancementRoutes from "./routes/youtubeEnhancement.js";
import authRoutes from "./routes/auth.js";
import studyNotesRoutes from "./routes/studyNotes.js";
import connectDB from "./config/database.js";

// Debug: Check if YouTube API key is loaded
console.log('🔑 YouTube API Key loaded:', process.env.YOUTUBE_API_KEY ? 'YES (length: ' + process.env.YOUTUBE_API_KEY.length + ')' : 'NO');

// Function to seed demo users into MongoDB
const seedDemoUsers = async () => {
  try {
    const demoUsers = [
      {
        name: 'John Student',
        email: 'student@demo.com',
        password: 'demo123',
        role: 'student'
      },
      {
        name: 'Jane Teacher',
        email: 'teacher@demo.com',
        password: 'demo123',
        role: 'teacher'
      },
      {
        name: 'Test User',
        email: 'test@example.com',
        password: 'test123',
        role: 'student'
      }
    ];

    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        await User.create(userData);
        console.log(`✅ Created demo user: ${userData.email}`);
      }
    }
    
    console.log('📝 Demo accounts available for testing:');
    console.log('   1. student@demo.com / demo123 (Student)');
    console.log('   2. teacher@demo.com / demo123 (Teacher)');
    console.log('   3. test@example.com / test123 (Student)');
  } catch (error) {
    console.error('❌ Error seeding demo users:', error.message);
  }
};


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
console.log('🔄 Connecting to MongoDB...');
console.log('🔍 MongoDB URI (masked):', mongoURI?.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@') || 'mongodb://localhost:27017/ai-tutor');

// Connect to MongoDB and seed demo users
connectDB().then(async (connection) => {
  if (connection) {
    // Seed demo users after successful connection
    await seedDemoUsers();
  }
}).catch((err) => {
  console.error('Failed to initialize database:', err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/planning', planningRoutes);
app.use('/api/hybrid', hybridPlanningRoutes);
app.use('/api/adaptive', adaptiveLearningRoutes);
app.use('/api/youtube', youtubeEnhancementRoutes);
app.use('/api/study-notes', studyNotesRoutes);

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