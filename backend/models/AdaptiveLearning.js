import mongoose from 'mongoose';

// Student Performance Schema
const studentPerformanceSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    index: true
  },
  testId: {
    type: String,
    required: true
  },
  subject: String,
  grade: String,
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  correctAnswers: Number,
  totalQuestions: Number,
  timeSpent: Number, // in minutes
  weakAreas: [String],
  strongAreas: [String],
  difficultyAnalysis: {
    easy: {
      correct: Number,
      total: Number
    },
    medium: {
      correct: Number,
      total: Number
    },
    hard: {
      correct: Number,
      total: Number
    }
  },
  learningEfficiency: Number,
  recommendations: {
    type: {
      type: String,
      enum: ['improvement', 'advancement', 'maintenance']
    },
    message: String,
    suggestedActions: [String]
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Student Feedback Schema
const studentFeedbackSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    index: true
  },
  subject: String,
  grade: String,
  ratings: {
    syllabus: {
      type: Number,
      min: 1,
      max: 5
    },
    difficulty: {
      type: Number,
      min: 1,
      max: 5
    },
    pace: {
      type: Number,
      min: 1,
      max: 5
    },
    engagement: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  comments: {
    pace: String,
    difficulty: String,
    suggestions: String,
    likes: String,
    dislikes: String
  },
  preferences: {
    learningStyle: {
      type: String,
      enum: ['visual', 'auditory', 'kinesthetic', 'reading/writing']
    },
    preferredTopics: [String],
    strugglingTopics: [String],
    studyTime: String,
    assessmentPreference: {
      type: String,
      enum: ['quiz', 'project', 'presentation', 'written_exam']
    }
  },
  topicRequests: [String],
  sentiment: {
    score: Number,
    label: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Adaptive Syllabus Schema
const adaptiveSyllabusSchema = new mongoose.Schema({
  originalSyllabusId: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  duration: Number,
  adaptedContent: {
    weeks: [{
      week: Number,
      topic: String,
      content: String,
      learningObjectives: [String],
      activities: [String],
      assessments: [String],
      resources: [String],
      additionalResources: String,
      enhanced: Boolean,
      difficultyLevel: {
        type: String,
        enum: ['easy', 'medium', 'hard']
      },
      estimatedHours: Number
    }]
  },
  adaptations: {
    performanceBasedChanges: [String],
    feedbackBasedChanges: [String],
    difficultyAdjustments: {
      type: String,
      enum: ['increase_difficulty', 'decrease_difficulty', 'maintain_difficulty']
    },
    paceModifications: {
      type: String,
      enum: ['speed_up', 'slow_down', 'maintain_pace']
    }
  },
  metadata: {
    adaptationDate: {
      type: Date,
      default: Date.now
    },
    studentsAnalyzed: Number,
    feedbackResponses: Number,
    adaptationLevel: {
      type: String,
      enum: ['minor', 'moderate', 'major']
    },
    avgClassPerformance: Number,
    commonWeakAreas: [String],
    teacherApproved: {
      type: Boolean,
      default: false
    },
    approvalDate: Date,
    approvedBy: String
  },
  status: {
    type: String,
    enum: ['draft', 'pending_review', 'approved', 'implemented'],
    default: 'draft'
  }
});

// Knowledge Test Schema
const knowledgeTestSchema = new mongoose.Schema({
  testId: {
    type: String,
    required: true,
    unique: true
  },
  subject: String,
  grade: String,
  topics: [String],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard']
  },
  questions: [{
    questionId: String,
    type: {
      type: String,
      enum: ['multiple-choice', 'short-answer', 'essay', 'true-false']
    },
    question: String,
    options: [String], // for multiple choice
    correctAnswer: String,
    explanation: String,
    topic: String,
    difficulty: String,
    points: {
      type: Number,
      default: 1
    },
    visualAids: String,
    audioHint: String,
    practicalApplication: String
  }],
  metadata: {
    totalQuestions: Number,
    totalPoints: Number,
    estimatedDuration: Number,
    adaptiveFeatures: [String],
    targetedWeakAreas: [String],
    learningStyle: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    createdBy: String, // teacher ID
    testType: {
      type: String,
      enum: ['diagnostic', 'formative', 'summative', 'adaptive'],
      default: 'adaptive'
    }
  },
  settings: {
    timeLimit: Number, // in minutes
    shuffleQuestions: {
      type: Boolean,
      default: true
    },
    showResults: {
      type: Boolean,
      default: true
    },
    allowRetakes: {
      type: Boolean,
      default: false
    },
    passingScore: {
      type: Number,
      default: 60
    }
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'archived'],
    default: 'draft'
  }
});

// Learning Analytics Schema
const learningAnalyticsSchema = new mongoose.Schema({
  classId: String,
  subject: String,
  grade: String,
  period: {
    startDate: Date,
    endDate: Date
  },
  analytics: {
    totalStudents: Number,
    averageScore: Number,
    performanceDistribution: {
      excellent: Number,
      good: Number,
      average: Number,
      below_average: Number,
      needs_improvement: Number
    },
    commonWeakAreas: [{
      area: String,
      count: Number,
      percentage: Number
    }],
    topPerformers: [String], // student IDs
    strugglingStudents: [String], // student IDs
    engagementMetrics: {
      averageTimeSpent: Number,
      completionRate: Number,
      feedbackResponseRate: Number
    }
  },
  trends: {
    performanceTrend: String, // 'improving', 'declining', 'stable'
    difficultyTrend: String,
    engagementTrend: String
  },
  recommendations: {
    forTeacher: [String],
    forClass: [String],
    forCurriculum: [String]
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  generatedBy: String // teacher ID
});

// Create indexes for better performance
studentPerformanceSchema.index({ studentId: 1, timestamp: -1 });
studentFeedbackSchema.index({ studentId: 1, timestamp: -1 });
adaptiveSyllabusSchema.index({ subject: 1, grade: 1 });
knowledgeTestSchema.index({ subject: 1, grade: 1, status: 1 });
learningAnalyticsSchema.index({ classId: 1, 'period.startDate': -1 });

// Export models
export const StudentPerformance = mongoose.model('StudentPerformance', studentPerformanceSchema);
export const StudentFeedback = mongoose.model('StudentFeedback', studentFeedbackSchema);
export const AdaptiveSyllabus = mongoose.model('AdaptiveSyllabus', adaptiveSyllabusSchema);
export const KnowledgeTest = mongoose.model('KnowledgeTest', knowledgeTestSchema);
export const LearningAnalytics = mongoose.model('LearningAnalytics', learningAnalyticsSchema);
