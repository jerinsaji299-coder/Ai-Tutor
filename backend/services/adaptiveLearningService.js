import AIOrchestrator from './aiOrchestrator.js';

class AdaptiveLearningService {
  constructor() {
    this.studentPerformanceData = new Map();
    this.feedbackAnalytics = new Map();
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generate adaptive knowledge tests based on detailed syllabus
  async generateKnowledgeTest(syllabusData, studentProfile = {}) {
    try {
      console.log('🧠 Generating adaptive knowledge test from syllabus...');
      
      const { subject, grade, topics, difficulty = 'medium', focusAreas = [] } = syllabusData;
      const { learningStyle, previousPerformance, weakAreas = [], weeksFocused = [] } = studentProfile;

      console.log('📚 Processing syllabus topics:', topics);
      console.log('🎯 Focus areas:', focusAreas);

      // Step 1: Generate comprehensive test questions using detailed syllabus content
      const testQuestions = await this.createSyllabusBasedQuestions(topics, focusAreas, difficulty, weakAreas);
      
      // Step 2: Personalize based on learning style and weekly focus
      const personalizedTest = await this.personalizeTestContent(testQuestions, learningStyle);
      
      // Step 3: Add performance tracking metadata
      const adaptiveTest = {
        id: `test_${Date.now()}`,
        subject,
        grade,
        topics: topics.map(t => t.title || t),
        difficulty,
        questions: personalizedTest,
        metadata: {
          totalQuestions: personalizedTest.length,
          estimatedDuration: personalizedTest.length * 2, // 2 minutes per question
          adaptiveFeatures: ['syllabus_aligned', 'weekly_focus', 'difficulty_adjustment'],
          createdAt: new Date().toISOString(),
          targetedWeeklyTopics: focusAreas.map(f => f.title || f),
          weeksFocused: weeksFocused,
          syllabusAlignment: 'high'
        }
      };

      return adaptiveTest;
    } catch (error) {
      console.error('Knowledge test generation error:', error);
      throw error;
    }
  }

  // Create syllabus-based questions with detailed content awareness
  async createSyllabusBasedQuestions(topics, focusAreas, difficulty, weakAreas) {
    const questions = [];
    
    // Determine total question count based on difficulty
    const targetQuestionCount = {
      'easy': 5,
      'medium': 7,
      'hard': 10
    }[difficulty] || 7;
    
    console.log(`🎯 Target: Generate ${targetQuestionCount} MCQ questions at ${difficulty} difficulty`);
    
    // Prioritize focus areas (first few weeks)
    const prioritizedTopics = [...focusAreas, ...topics.filter(t => !focusAreas.some(f => (f.title || f) === (t.title || t)))];
    
    // Calculate questions per topic
    const topicsToUse = Math.min(prioritizedTopics.length, targetQuestionCount);
    const questionsPerTopic = Math.ceil(targetQuestionCount / topicsToUse);
    
    console.log(`📚 Distributing ${questionsPerTopic} questions across ${topicsToUse} topics`);
    
    for (const topicData of prioritizedTopics.slice(0, topicsToUse)) {
      const maxRetries = 2;
      const retryDelay = 1000;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const topicTitle = topicData.title || topicData;
          const topicContent = topicData.description || '';
          const objectives = topicData.objectives || [];
          const weekNumber = topicData.weekNumber || 'N/A';

          console.log(`📝 Generating questions for Week ${weekNumber}: ${topicTitle} (Attempt ${attempt}/${maxRetries})...`);
          
          // Generate more questions for weak areas and focus areas
          const isWeakArea = weakAreas.some(wa => topicTitle.toLowerCase().includes(wa.toLowerCase()));
          const isFocusArea = focusAreas.some(fa => (fa.title || fa) === topicTitle);

          // Generate multiple questions per topic
          const questionsToGenerate = Math.min(questionsPerTopic, targetQuestionCount - questions.length);
          
          console.log(`📝 Generating ${questionsToGenerate} question(s) for Week ${weekNumber}: ${topicTitle} (Attempt ${attempt}/${maxRetries})...`);

          // Create detailed context for AI MCQ generation
          const questionContext = this.buildMCQContext(topicTitle, topicContent, objectives, weekNumber, difficulty);
          
          // Try to use AI services with fallback
          let generatedQuestions = [];
          
          try {
            // Use AI Orchestrator for MCQ generation - request multiple questions
            const aiQuestions = await AIOrchestrator.executeWithMonitoring(
              'gemini',
              'complex-questions',
              {
                topic: topicTitle,
                context: questionContext.detailed,
                difficulty,
                questionCount: questionsToGenerate,
                questionType: 'multiple-choice',
                requireOptions: true,
                weekContent: topicContent,
                learningObjectives: objectives,
                format: `Generate ${questionsToGenerate} different MCQs, each with 4 unique options (A, B, C, D) and correct answer`
              }
            );
            if (aiQuestions && aiQuestions.length > 0) {
              generatedQuestions.push(...aiQuestions);
            }
          } catch (aiError) {
            console.warn('AI question generation failed, using fallback');
          }

          // If we got questions, add them (up to the number we need)
          if (generatedQuestions.length > 0) {
            const questionsToAdd = generatedQuestions.slice(0, questionsToGenerate);
            questions.push(...questionsToAdd);
            console.log(`✅ Generated ${questionsToAdd.length} question(s) for Week ${weekNumber}: ${topicTitle}`);
          } else {
            // Create fallback questions
            for (let i = 0; i < questionsToGenerate; i++) {
              questions.push(this.createSyllabusBasedFallbackQuestion(topicData, difficulty, questions.length + 1));
            }
            console.log(`🔄 Used ${questionsToGenerate} fallback question(s) for Week ${weekNumber}: ${topicTitle}`);
          }
          
          break; // Success, exit retry loop

        } catch (error) {
          console.warn(`❌ Question generation attempt ${attempt} failed for ${topicData.title || topicData}:`, error.message);
          
          if (attempt === maxRetries) {
            console.log(`🔄 All retries failed for ${topicData.title || topicData}, using fallback`);
            const questionsToGenerate = Math.min(questionsPerTopic, targetQuestionCount - questions.length);
            for (let i = 0; i < questionsToGenerate; i++) {
              questions.push(this.createSyllabusBasedFallbackQuestion(topicData, difficulty, questions.length + 1));
            }
          } else {
            console.log(`⏳ Waiting ${retryDelay * attempt}ms before retry...`);
            await this.sleep(retryDelay * attempt);
          }
        }
      }
      
      // Break if we've reached target question count
      if (questions.length >= targetQuestionCount) {
        break;
      }
    }

    // Ensure we have at least the target number of questions
    while (questions.length < targetQuestionCount) {
      const fallbackTopic = prioritizedTopics[questions.length % prioritizedTopics.length];
      questions.push(this.createSyllabusBasedFallbackQuestion(fallbackTopic, difficulty, questions.length + 1));
      console.log(`➕ Added fallback question ${questions.length}/${targetQuestionCount}`);
    }

    console.log(`🎉 Successfully generated ${questions.length} total MCQ questions`);
    return questions.slice(0, targetQuestionCount); // Ensure exact count
  }

  // Build comprehensive MCQ context from syllabus data with actual content focus
  buildMCQContext(topicTitle, content, objectives, weekNumber, difficulty) {
    // Extract key concepts from content
    const keyPhrases = this.extractKeyConceptsFromContent(content);
    
    return {
      basic: `Week ${weekNumber} - ${topicTitle}: ${content.substring(0, 200)}. Create ${difficulty} level multiple choice questions with 4 options.`,
      detailed: `
YOU ARE AN EXPERT EDUCATIONAL ASSESSMENT DESIGNER. Generate SPECIFIC, CONTENT-BASED Multiple Choice Questions.

SYLLABUS CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Week Number: ${weekNumber}
Topic: ${topicTitle}

ACTUAL CONTENT TO TEST:
${content}

LEARNING OBJECTIVES:
${objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

KEY CONCEPTS TO ASSESS: ${keyPhrases.join(', ')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITICAL INSTRUCTIONS:
1. Questions MUST be based on the ACTUAL CONTENT above, not generic knowledge
2. Use SPECIFIC TERMS, CONCEPTS, and EXAMPLES from the content
3. Test SPECIFIC LEARNING OBJECTIVES listed above
4. Create questions at ${difficulty} difficulty level
5. Include REALISTIC distractors based on common misconceptions

QUESTION FORMAT REQUIRED:
{
  "question": "[Specific question about actual content from Week ${weekNumber}]",
  "options": [
    "[Correct answer using exact terminology from content]",
    "[Plausible distractor based on related concept]",
    "[Common misconception about the topic]",
    "[Incorrect but reasonable sounding option]"
  ],
  "correctAnswer": "[Exact text of correct option]",
  "explanation": "This tests [specific objective]. The correct answer is based on [specific part of content]. Common mistakes include [mention distractors].",
  "relatedConcepts": ["concept1 from content", "concept2 from content"],
  "studyReferences": "[Specific section/paragraph from content to review]"
}

DIFFICULTY LEVELS:
- Easy: Direct recall of key facts/definitions from content
- Medium: Application and understanding of concepts from content
- Hard: Analysis, synthesis, or evaluation of multiple concepts from content

Generate a question that:
✓ References SPECIFIC content from the syllabus
✓ Tests one of the stated learning objectives
✓ Uses technical terms from the actual material
✓ Has realistic, plausible distractors
✓ Includes explanation referencing the content
✓ Provides specific study guidance

DO NOT create generic questions. Every question must be DIRECTLY tied to the provided content.
      `
    };
  }

  // Extract key concepts from content for targeted questioning
  extractKeyConceptsFromContent(content) {
    if (!content || content.length < 50) {
      return ['core concepts', 'key principles', 'fundamental ideas'];
    }

    // Simple keyword extraction - look for capitalized terms, technical words
    const concepts = [];
    
    // Split into sentences
    const sentences = content.split(/[.!?]+/);
    
    // Extract important terms (capitalized, technical terms)
    const words = content.split(/\s+/);
    const technicalTerms = words.filter(word => 
      word.length > 4 && 
      (word[0] === word[0].toUpperCase() || word.includes('-') || word.includes('_'))
    );
    
    // Get first few sentences for context
    const mainIdeas = sentences.slice(0, 3).map(s => s.trim()).filter(s => s.length > 20);
    
    // Combine unique technical terms
    const uniqueTerms = [...new Set(technicalTerms)].slice(0, 5);
    
    return uniqueTerms.length > 0 ? uniqueTerms : ['key concepts', 'main principles', 'core ideas'];
  }

  // Create CONTENT-SPECIFIC fallback MCQ based on actual syllabus content
  createSyllabusBasedFallbackQuestion(topicData, difficulty, questionNumber = 1) {
    const topicTitle = topicData.title || topicData;
    const weekNumber = topicData.weekNumber || 'N/A';
    const content = topicData.description || '';
    const objectives = topicData.objectives || [];
    
    // Extract actual content snippets for questions
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 30);
    const keyPhrases = this.extractKeyConceptsFromContent(content);
    
    // Parse content to extract actual facts and concepts
    const contentWords = content.toLowerCase().split(/\s+/);
    const topicWords = topicTitle.toLowerCase().split(/\s+/);
    
    // Create REAL content-based question templates (not meta-questions)
    const contentBasedTemplates = [
      {
        // Template 1: Direct Factual Question from Content
        question: sentences.length > 0
          ? `In ${topicTitle}, ${sentences[0].trim().toLowerCase()}. What is the primary significance of this?`
          : `What is a fundamental concept in ${topicTitle}?`,
        options: [
          sentences.length > 1 ? sentences[1].trim() : `It forms the foundation for understanding ${topicTitle}`,
          `It has no practical application`,
          `It contradicts basic principles`,
          `It is only used in advanced scenarios`
        ],
        correctIndex: 0,
        explanation: `This concept is essential in ${topicTitle}. ${sentences.slice(0, 2).join('. ')}`,
        studyTopics: keyPhrases.slice(0, 3)
      },
      {
        // Template 2: Concept Application Question
        question: keyPhrases.length >= 2
          ? `When working with ${topicTitle}, how would you apply ${keyPhrases[0]} in practice?`
          : `How is ${topicTitle} typically applied in real-world scenarios?`,
        options: [
          sentences.length > 2 ? `By ${sentences[2].trim().toLowerCase()}` : `Through systematic implementation of core principles`,
          `By avoiding its core principles`,
          `By using unrelated methodologies`,
          `It cannot be applied practically`
        ],
        correctIndex: 0,
        explanation: `In ${topicTitle}, practical application involves: ${sentences.slice(1, 3).join('. ')}`,
        studyTopics: [...keyPhrases, topicTitle]
      },
      {
        // Template 3: Technical Definition Question
        question: keyPhrases.length > 0
          ? `In the context of ${topicTitle}, what best describes ${keyPhrases[0]}?`
          : `What is the key characteristic of ${topicTitle}?`,
        options: [
          content.length > 100 ? content.substring(0, 70) + '...' : `A fundamental component that enables understanding`,
          `An obsolete concept no longer in use`,
          `A theoretical idea with no basis`,
          `An optional consideration`
        ],
        correctIndex: 0,
        explanation: `${keyPhrases[0] || topicTitle} is defined in the course as: ${sentences[0] || content.substring(0, 150)}`,
        studyTopics: keyPhrases.concat([topicTitle])
      },
      {
        // Template 4: Comparison/Contrast Question
        question: keyPhrases.length >= 2
          ? `What distinguishes ${keyPhrases[0]} from ${keyPhrases[1]} in ${topicTitle}?`
          : `What is a distinguishing feature of ${topicTitle}?`,
        options: [
          sentences.length > 1 ? sentences[1].trim() : `Their approach to problem-solving differs fundamentally`,
          `They are identical concepts`,
          `Neither is relevant to the topic`,
          `One is superior in all cases`
        ],
        correctIndex: 0,
        explanation: `Understanding the distinction is crucial: ${sentences.join('. ').substring(0, 200)}`,
        studyTopics: keyPhrases.length >= 2 ? [keyPhrases[0], keyPhrases[1], topicTitle] : [topicTitle]
      },
      {
        // Template 5: Problem-Solving Question
        question: objectives.length > 0
          ? `To achieve "${objectives[0]}" in ${topicTitle}, what approach is most effective?`
          : `What is the recommended approach when learning ${topicTitle}?`,
        options: [
          sentences.length > 0 ? sentences[0].trim() : `Start with fundamental principles and build up progressively`,
          `Skip foundational concepts`,
          `Memorize without understanding`,
          `Focus only on advanced topics`
        ],
        correctIndex: 0,
        explanation: `The course emphasizes: ${sentences.slice(0, 2).join('. ') || content.substring(0, 150)}`,
        studyTopics: objectives.length > 0 ? [objectives[0], topicTitle] : [topicTitle]
      }
    ];
    
    // Select template based on question number for variety
    const templateIndex = (questionNumber - 1) % contentBasedTemplates.length;
    const selectedTemplate = contentBasedTemplates[templateIndex];
    
    return {
      id: `mcq_${Date.now()}_${questionNumber}_${Math.random().toString(36).substr(2, 9)}`,
      questionNumber: questionNumber,
      question: selectedTemplate.question,
      type: 'multiple-choice',
      options: selectedTemplate.options,
      correctAnswer: selectedTemplate.options[selectedTemplate.correctIndex],
      explanation: selectedTemplate.explanation,
      topic: topicTitle,
      week: weekNumber,
      difficulty: difficulty,
      points: difficulty === 'easy' ? 5 : difficulty === 'medium' ? 8 : 12,
      source: 'content_specific_fallback',
      learningObjectives: objectives,
      studyTopics: selectedTemplate.studyTopics, // ACTUAL topics to study for improvement
      relatedConcepts: keyPhrases,
      contentReference: sentences[0] || content.substring(0, 150)
    };
  }

  // Personalize test content based on learning style
  async personalizeTestContent(questions, learningStyle) {
    if (!learningStyle) return questions;

    return questions.map(question => {
      const enhancedQuestion = { ...question };
      
      switch (learningStyle) {
        case 'visual':
          enhancedQuestion.instructions = 'Consider using diagrams, charts, or visual representations in your answer.';
          enhancedQuestion.hint = 'Think about how you would visualize this concept.';
          break;
        case 'auditory':
          enhancedQuestion.instructions = 'Explain your answer as if you were teaching someone else.';
          enhancedQuestion.hint = 'Think about how you would explain this concept verbally.';
          break;
        case 'kinesthetic':
          enhancedQuestion.instructions = 'Consider practical applications and hands-on examples.';
          enhancedQuestion.hint = 'Think about real-world scenarios where this applies.';
          break;
        case 'reading':
          enhancedQuestion.instructions = 'Provide a detailed written explanation with examples.';
          enhancedQuestion.hint = 'Consider referencing specific concepts from your readings.';
          break;
        default:
          enhancedQuestion.instructions = 'Provide a comprehensive answer demonstrating your understanding.';
      }
      
      return enhancedQuestion;
    });
  }

  // Analyze student performance with detailed feedback
  async analyzeStudentPerformance(testResults, testMetadata) {
    try {
      console.log('📊 Analyzing student performance...');
      
      const { answers, timeSpent, testId } = testResults;
      const { topics, difficulty, weeksFocused } = testMetadata;

      // Calculate basic metrics
      const totalQuestions = answers.length;
      const correctAnswers = answers.filter(a => a.isCorrect).length;
      const score = Math.round((correctAnswers / totalQuestions) * 100);

      // Analyze performance by week/topic
      const weeklyPerformance = this.analyzeWeeklyPerformance(answers);
      
      // Identify weak and strong areas from syllabus content
      const weakAreas = this.identifyWeakAreasFromSyllabus(answers, topics);
      const strongAreas = this.identifyStrongAreasFromSyllabus(answers, topics);

      // Generate recommendations based on performance
      const recommendations = this.generatePerformanceRecommendations(
        { score, weeklyPerformance, weakAreas, strongAreas },
        { topics, difficulty, weeksFocused }
      );

      const performanceData = {
        testId,
        score,
        totalQuestions,
        correctAnswers,
        timeSpent,
        weeklyPerformance,
        weakAreas,
        strongAreas,
        recommendations,
        difficulty,
        syllabusAlignment: {
          weeksCovered: weeksFocused,
          topicsAssessed: topics,
          focusAreaPerformance: weeklyPerformance
        },
        timestamp: new Date().toISOString()
      };

      // Store performance data
      this.studentPerformanceData.set(testId, performanceData);

      return performanceData;
    } catch (error) {
      console.error('Performance analysis error:', error);
      throw error;
    }
  }

  // Additional helper methods
  analyzeWeeklyPerformance(answers) {
    const weeklyStats = {};
    
    answers.forEach(answer => {
      const week = answer.week || 'Unknown';
      if (!weeklyStats[week]) {
        weeklyStats[week] = { correct: 0, total: 0, topics: [] };
      }
      
      weeklyStats[week].total++;
      if (answer.isCorrect) {
        weeklyStats[week].correct++;
      }
      
      if (answer.topic && !weeklyStats[week].topics.includes(answer.topic)) {
        weeklyStats[week].topics.push(answer.topic);
      }
    });

    return weeklyStats;
  }

  identifyWeakAreasFromSyllabus(answers, syllabusTopics) {
    return answers.filter(a => !a.isCorrect).map(a => a.topic).filter(Boolean);
  }

  identifyStrongAreasFromSyllabus(answers, syllabusTopics) {
    return answers.filter(a => a.isCorrect).map(a => a.topic).filter(Boolean);
  }

  generatePerformanceRecommendations(performanceData, testMetadata) {
    const { score } = performanceData;
    
    return {
      overall: score >= 80 ? 'Excellent performance!' : score >= 60 ? 'Good work, review weak areas' : 'Additional study recommended',
      weeklyFocus: [],
      improvementAreas: performanceData.weakAreas.map(area => ({ topic: area, suggestion: `Review ${area} concepts` })),
      strengthAreas: performanceData.strongAreas.map(area => ({ topic: area, suggestion: `Continue excellent work on ${area}` }))
    };
  }

  // Collect and analyze student feedback
  async collectStudentFeedback(feedbackData) {
    try {
      console.log('📝 Processing student feedback...');
      
      const feedbackId = `feedback_${Date.now()}`;
      const processedFeedback = {
        id: feedbackId,
        ...feedbackData,
        timestamp: new Date().toISOString()
      };

      this.feedbackAnalytics.set(feedbackId, processedFeedback);
      
      return {
        success: true,
        feedbackId,
        analysis: { averageRating: feedbackData.syllabusRating || 0 },
        recommendations: []
      };
    } catch (error) {
      console.error('Feedback collection error:', error);
      throw error;
    }
  }

  // Generate adaptive syllabus based on performance and feedback
  async generateAdaptiveSyllabus(originalSyllabus, studentData) {
    try {
      console.log('🎯 Generating adaptive syllabus...');
      
      return {
        success: true,
        originalSyllabus,
        adaptiveSyllabus: originalSyllabus, // Simplified for now
        adaptationReasoning: { paceAdjustments: [], difficultyModifications: [] },
        implementationSuggestions: []
      };
    } catch (error) {
      console.error('Adaptive syllabus generation error:', error);
      throw error;
    }
  }
}

export default AdaptiveLearningService;