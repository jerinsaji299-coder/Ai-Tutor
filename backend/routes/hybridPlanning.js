import express from 'express';
import AIOrchestrator from '../services/aiOrchestrator.js';

const router = express.Router();

// Enhanced teaching plan generation with hybrid AI
router.post('/generate-hybrid-plan', async (req, res) => {
  try {
    const { subject, grade, duration, syllabus } = req.body;

    console.log('🔄 Starting hybrid AI plan generation...');

    // Step 1: Gemini creates the main curriculum structure
    console.log('🤖 Gemini: Generating main curriculum...');
    const mainCurriculum = await AIOrchestrator.executeWithMonitoring(
      'gemini', 
      'curriculum-generation', 
      { subject, grade, duration, syllabus }
    );

    // Step 2: HuggingFace summarizes each week's content
    console.log('🤗 HuggingFace: Summarizing weekly content...');
    const weekSummaries = await Promise.all(
      mainCurriculum.weeks.map(async (week) => {
        try {
          const summary = await AIOrchestrator.executeWithMonitoring(
            'huggingface',
            'text-summarization',
            { text: week.content || week.topic }
          );
          return { ...week, summary };
        } catch (error) {
          console.warn(`Summary failed for week ${week.week}, using fallback`);
          return { ...week, summary: `Week ${week.week}: ${week.topic}` };
        }
      })
    );

    // Step 3: HuggingFace classifies difficulty levels
    console.log('🤗 HuggingFace: Classifying content difficulty...');
    let difficultyAnalysis;
    try {
      difficultyAnalysis = await AIOrchestrator.executeWithMonitoring(
        'huggingface',
        'content-classification',
        { text: syllabus }
      );
    } catch (error) {
      console.warn('Difficulty classification failed, using default');
      difficultyAnalysis = [{ label: 'INTERMEDIATE', score: 0.8 }];
    }

    // Step 4: HuggingFace generates quick assessment questions
    console.log('🤗 HuggingFace: Generating assessment questions...');
    const assessmentQuestions = await Promise.all(
      weekSummaries.slice(0, 3).map(async (week) => { // Limit to first 3 weeks to avoid rate limits
        try {
          const questions = await AIOrchestrator.executeWithMonitoring(
            'huggingface',
            'question-generation',
            { context: week.content || week.topic }
          );
          return { week: week.week, questions: questions.slice(0, 2) }; // Limit questions per week
        } catch (error) {
          console.warn(`Question generation failed for week ${week.week}`);
          return { 
            week: week.week, 
            questions: [{
              id: `fallback-${week.week}-1`,
              type: 'short-answer',
              question: `What are the key concepts in ${week.topic}?`,
              correctAnswer: 'Key concepts include the main topics covered in this week.',
              explanation: `Understanding ${week.topic} is essential for this course.`,
              difficulty: 'Medium'
            }]
          };
        }
      })
    );

    // Step 5: Optional translations (only if requested)
    let translations = {};
    if (req.body.includeTranslations) {
      console.log('🤗 HuggingFace: Adding multilingual support...');
      try {
        const spanishTitle = await AIOrchestrator.executeWithMonitoring(
          'huggingface',
          'translation',
          { text: mainCurriculum.title, targetLang: 'es' }
        );
        translations.spanish = spanishTitle;
      } catch (error) {
        console.warn('Translation failed, skipping...');
      }
    }

    const hybridPlan = {
      title: mainCurriculum.title,
      subject,
      grade,
      duration,
      weeks: weekSummaries,
      difficulty: difficultyAnalysis,
      assessments: assessmentQuestions,
      translations,
      metadata: {
        generatedBy: 'Hybrid AI (Gemini + HuggingFace)',
        geminiTasks: ['curriculum-generation'],
        huggingfaceTasks: ['summarization', 'classification', 'question-generation'],
        timestamp: new Date().toISOString(),
        processingTime: Date.now()
      }
    };

    console.log('✅ Hybrid plan generation completed successfully');
    res.json(hybridPlan);

  } catch (error) {
    console.error('❌ Hybrid plan generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate hybrid teaching plan',
      details: error.message,
      fallbackAdvice: 'Try using the standard plan generation endpoint'
    });
  }
});

// Enhanced quiz generation with hybrid approach
router.post('/generate-hybrid-quiz', async (req, res) => {
  try {
    const { topic, difficulty, questionCount, teachingPlan } = req.body;

    console.log('🔄 Starting hybrid quiz generation...');

    const baseQuestionCount = Math.ceil(questionCount * 0.6);
    const advancedQuestionCount = Math.floor(questionCount * 0.4);

    // Step 1: HuggingFace generates basic questions quickly
    console.log('🤗 HuggingFace: Generating base questions...');
    let baseQuestions = [];
    try {
      baseQuestions = await AIOrchestrator.executeWithMonitoring(
        'huggingface',
        'question-generation',
        { context: `Generate ${baseQuestionCount} ${difficulty} questions about ${topic}` }
      );
    } catch (error) {
      console.warn('HF question generation failed, using fallback');
      baseQuestions = [{
        id: 'hf-fallback-1',
        type: 'short-answer',
        question: `What is the main concept of ${topic}?`,
        correctAnswer: `The main concept involves understanding the key principles of ${topic}.`,
        explanation: `This question tests basic comprehension of ${topic}.`,
        difficulty: difficulty
      }];
    }

    // Step 2: Gemini creates complex, creative questions
    console.log('🤖 Gemini: Creating advanced questions...');
    let advancedQuestions = [];
    try {
      advancedQuestions = await AIOrchestrator.executeWithMonitoring(
        'gemini',
        'complex-questions',
        {
          topic,
          difficulty,
          questionCount: advancedQuestionCount,
          context: teachingPlan?.content || `Advanced concepts in ${topic}`
        }
      );
    } catch (error) {
      console.warn('Gemini question generation failed, using fallback');
      advancedQuestions = [{
        id: 'gemini-fallback-1',
        type: 'multiple-choice',
        question: `Which of the following best describes ${topic}?`,
        options: [
          `A comprehensive educational concept`,
          `An optional learning topic`,
          `A basic introductory subject`,
          `An advanced specialization`
        ],
        correctAnswer: 'A comprehensive educational concept',
        explanation: `${topic} represents a comprehensive area of study with multiple interconnected concepts.`,
        difficulty: difficulty
      }];
    }

    // Step 3: Combine and validate questions
    const allQuestions = [...baseQuestions, ...advancedQuestions].slice(0, questionCount);

    // Step 4: Optional difficulty validation with HuggingFace
    let validatedQuestions = allQuestions;
    if (req.body.validateDifficulty) {
      console.log('🤗 HuggingFace: Validating question difficulty...');
      try {
        validatedQuestions = await Promise.all(
          allQuestions.map(async (q, index) => {
            try {
              const classification = await AIOrchestrator.executeWithMonitoring(
                'huggingface',
                'content-classification',
                { text: q.question }
              );
              return { ...q, validatedDifficulty: classification[0]?.label || difficulty };
            } catch (error) {
              return { ...q, validatedDifficulty: difficulty };
            }
          })
        );
      } catch (error) {
        console.warn('Difficulty validation failed, using original questions');
      }
    }

    const hybridQuiz = {
      topic,
      difficulty,
      questionCount: validatedQuestions.length,
      questions: validatedQuestions,
      analytics: {
        baseQuestionsCount: baseQuestions.length,
        advancedQuestionsCount: advancedQuestions.length,
        averageDifficulty: difficulty,
        generationMethod: 'hybrid'
      },
      metadata: {
        generatedBy: 'Hybrid AI System',
        geminiContribution: 'Complex questions and reasoning',
        huggingfaceContribution: 'Base questions and classification',
        timestamp: new Date().toISOString()
      }
    };

    console.log('✅ Hybrid quiz generation completed successfully');
    res.json(hybridQuiz);

  } catch (error) {
    console.error('❌ Hybrid quiz generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate hybrid quiz',
      details: error.message,
      fallbackAdvice: 'Try using the standard quiz generation endpoint'
    });
  }
});

// Health check endpoint for hybrid system
router.get('/hybrid-health', async (req, res) => {
  try {
    console.log('🔍 Checking hybrid AI system health...');
    const healthReport = await AIOrchestrator.healthCheck();
    
    const overallStatus = Object.values(healthReport.services).every(
      service => service.status === 'healthy'
    ) ? 'healthy' : 'partial';

    res.json({
      status: overallStatus,
      message: `Hybrid AI system is ${overallStatus}`,
      services: healthReport.services,
      timestamp: healthReport.timestamp
    });

  } catch (error) {
    console.error('❌ Health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Test endpoint for individual services
router.post('/test-service', async (req, res) => {
  try {
    const { service, taskType, testData } = req.body;

    console.log(`🧪 Testing ${service} service with ${taskType}...`);
    
    const result = await AIOrchestrator.executeWithMonitoring(
      service,
      taskType,
      testData || { text: 'Test content', context: 'Test context' }
    );

    res.json({
      success: true,
      service,
      taskType,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`❌ Service test failed:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
