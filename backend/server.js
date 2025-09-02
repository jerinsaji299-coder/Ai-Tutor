import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import Plan from "./models/Plan.js";
import planningRoutes from "./routes/planning.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting for hackathon demo (generous limits)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api', limiter);

// Routes
app.use('/api/planning', planningRoutes);

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