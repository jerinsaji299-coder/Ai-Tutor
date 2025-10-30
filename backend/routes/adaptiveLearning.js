import express from 'express';
import AdaptiveLearningService from '../services/adaptiveLearningService.js';
import AIOrchestrator from '../services/aiOrchestrator.js';

const router = express.Router();
const adaptiveLearningService = new AdaptiveLearningService();

// Generate adaptive knowledge test for students
router.post('/generate-knowledge-test', async (req, res) => {
  try {
    const { syllabusData, studentProfile } = req.body;
    
    console.log('🧠 Generating adaptive knowledge test...');
    
    const knowledgeTest = await adaptiveLearningService.generateKnowledgeTest(
      syllabusData, 
      studentProfile
    );
    
    res.json({
      success: true,
      test: knowledgeTest,
      message: 'Adaptive knowledge test generated successfully'
    });
  } catch (error) {
    console.error('Knowledge test generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate knowledge test',
      details: error.message
    });
  }
});

// Analyze student performance after test completion
router.post('/analyze-performance', async (req, res) => {
  try {
    const { studentId, testResults } = req.body;
    
    console.log(`📊 Analyzing performance for student: ${studentId}`);
    
    const performanceAnalysis = await adaptiveLearningService.analyzeStudentPerformance(
      studentId, 
      testResults
    );
    
    res.json({
      success: true,
      analysis: performanceAnalysis,
      message: 'Performance analysis completed'
    });
  } catch (error) {
    console.error('Performance analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze performance',
      details: error.message
    });
  }
});

// Collect student feedback
router.post('/submit-feedback', async (req, res) => {
  try {
    const { studentId, feedbackData } = req.body;
    
    console.log(`💬 Processing feedback from student: ${studentId}`);
    
    const processedFeedback = await adaptiveLearningService.collectStudentFeedback(
      studentId, 
      feedbackData
    );
    
    res.json({
      success: true,
      feedback: processedFeedback,
      message: 'Feedback collected and analyzed successfully'
    });
  } catch (error) {
    console.error('Feedback processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process feedback',
      details: error.message
    });
  }
});

// Generate adaptive syllabus based on performance and feedback
router.post('/generate-adaptive-syllabus', async (req, res) => {
  try {
    const { originalSyllabus, studentIds } = req.body;
    
    console.log('🔄 Generating adaptive syllabus...');
    
    // Collect performance data for all students
    const performanceData = [];
    const feedbackData = [];
    
    for (const studentId of studentIds) {
      const performance = adaptiveLearningService.studentPerformanceData.get(studentId);
      const feedback = adaptiveLearningService.feedbackAnalytics.get(studentId) || [];
      
      if (performance) performanceData.push(performance);
      feedbackData.push(...feedback);
    }
    
    if (performanceData.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No performance data available for adaptation'
      });
    }
    
    const adaptiveSyllabus = await adaptiveLearningService.generateAdaptiveSyllabus(
      originalSyllabus,
      performanceData,
      feedbackData
    );
    
    res.json({
      success: true,
      syllabus: adaptiveSyllabus,
      message: 'Adaptive syllabus generated successfully'
    });
  } catch (error) {
    console.error('Adaptive syllabus generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate adaptive syllabus',
      details: error.message
    });
  }
});

// Get student performance dashboard
router.get('/student-dashboard/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const performance = adaptiveLearningService.studentPerformanceData.get(studentId);
    const feedback = adaptiveLearningService.feedbackAnalytics.get(studentId) || [];
    
    if (!performance) {
      return res.status(404).json({
        success: false,
        error: 'No performance data found for this student'
      });
    }
    
    const dashboard = {
      studentId,
      performance,
      feedbackHistory: feedback,
      learningProgress: {
        strongAreas: performance.strongAreas,
        weakAreas: performance.weakAreas,
        overallScore: performance.score,
        efficiency: performance.learningEfficiency,
        recommendations: performance.recommendations
      },
      lastUpdated: performance.timestamp
    };
    
    res.json({
      success: true,
      dashboard,
      message: 'Student dashboard data retrieved'
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard data',
      details: error.message
    });
  }
});

// Get class analytics for teachers
router.get('/class-analytics', async (req, res) => {
  try {
    const allPerformanceData = Array.from(adaptiveLearningService.studentPerformanceData.values());
    const allFeedbackData = Array.from(adaptiveLearningService.feedbackAnalytics.values()).flat();
    
    if (allPerformanceData.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No performance data available'
      });
    }
    
    const analytics = {
      totalStudents: allPerformanceData.length,
      averageScore: allPerformanceData.reduce((sum, p) => sum + p.score, 0) / allPerformanceData.length,
      commonWeakAreas: getCommonWeakAreas(allPerformanceData),
      performanceDistribution: getPerformanceDistribution(allPerformanceData),
      feedbackSummary: summarizeFeedback(allFeedbackData),
      recommendations: await generateClassRecommendations(allPerformanceData, allFeedbackData)
    };
    
    res.json({
      success: true,
      analytics,
      message: 'Class analytics retrieved successfully'
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve analytics',
      details: error.message
    });
  }
});

// Test specific topics for quick assessment
router.post('/quick-topic-test', async (req, res) => {
  try {
    const { topics, difficulty = 'medium', questionCount = 5 } = req.body;
    
    console.log('⚡ Generating quick topic test...');
    
    const quickTest = {
      id: `quick_test_${Date.now()}`,
      type: 'topic_assessment',
      topics,
      difficulty,
      questions: [],
      metadata: {
        estimatedDuration: questionCount * 1.5, // 1.5 minutes per question
        createdAt: new Date().toISOString()
      }
    };
    
    // Generate questions for each topic
    for (const topic of topics) {
      try {
        const questions = await AIOrchestrator.executeWithMonitoring(
          'huggingface',
          'question-generation',
          { 
            context: `Generate ${Math.ceil(questionCount / topics.length)} ${difficulty} questions about ${topic}`,
            model: 'valhalla/t5-small-qa-qg-hl'
          }
        );
        quickTest.questions.push(...questions);
      } catch (error) {
        console.warn(`Question generation failed for ${topic}`);
      }
    }
    
    res.json({
      success: true,
      test: quickTest,
      message: 'Quick topic test generated'
    });
  } catch (error) {
    console.error('Quick test error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate quick test',
      details: error.message
    });
  }
});

// Helper functions for analytics
function getCommonWeakAreas(performanceData) {
  const weakAreas = {};
  performanceData.forEach(performance => {
    performance.weakAreas.forEach(area => {
      weakAreas[area] = (weakAreas[area] || 0) + 1;
    });
  });
  return Object.entries(weakAreas)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([area, count]) => ({ area, count }));
}

function getPerformanceDistribution(performanceData) {
  const ranges = {
    'excellent': 0, // 90-100
    'good': 0,      // 80-89
    'average': 0,   // 70-79
    'below_average': 0, // 60-69
    'needs_improvement': 0 // <60
  };
  
  performanceData.forEach(performance => {
    const score = performance.score;
    if (score >= 90) ranges.excellent++;
    else if (score >= 80) ranges.good++;
    else if (score >= 70) ranges.average++;
    else if (score >= 60) ranges.below_average++;
    else ranges.needs_improvement++;
  });
  
  return ranges;
}

function summarizeFeedback(feedbackData) {
  return {
    totalResponses: feedbackData.length,
    averageRating: feedbackData.reduce((sum, f) => sum + (f.ratings?.syllabus || 0), 0) / feedbackData.length,
    commonSuggestions: feedbackData
      .map(f => f.comments?.suggestions)
      .filter(Boolean)
      .slice(0, 10)
  };
}

// Helper functions for analytics
async function generateClassRecommendations(performanceData, feedbackData) {
  try {
    const weakAreas = getCommonWeakAreas(performanceData);
    const avgScore = performanceData.reduce((sum, p) => sum + p.score, 0) / performanceData.length;
    
    // Use Gemini for generating class recommendations
    const recommendationPrompt = {
      topic: 'Class Teaching Recommendations',
      difficulty: 'medium',
      questionCount: 1,
      context: `Generate teaching recommendations for a class with average performance: ${avgScore}%, common weak areas: ${weakAreas.map(w => w.area).join(', ')}, feedback responses: ${feedbackData.length}`
    };

    const result = await AIOrchestrator.executeWithMonitoring(
      'gemini',
      'complex-questions',
      recommendationPrompt
    );

    if (result && result.length > 0) {
      return result.map(r => r.explanation || r.question).slice(0, 3);
    }
    
    return [
      'Review common weak areas in class',
      'Adjust teaching pace based on performance',
      'Provide additional practice materials'
    ];
  } catch (error) {
    console.warn('Class recommendations generation failed:', error);
    return [
      'Review common weak areas in class',
      'Adjust teaching pace based on performance',
      'Provide additional practice materials'
    ];
  }
}

export default router;
