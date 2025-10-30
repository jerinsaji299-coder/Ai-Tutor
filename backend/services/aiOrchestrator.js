import HuggingFaceService from './huggingfaceService.js';

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
  }

  async generateCurriculum(data) {
    const { subject, grade, duration, syllabus } = data;
    
    const prompt = `Create a comprehensive ${duration}-week curriculum for ${subject}, Grade ${grade}.
    
Syllabus: ${syllabus}

Please provide a detailed semester plan with:
1. Weekly breakdown of topics
2. Learning objectives for each week
3. Suggested activities and assessments
4. Resource recommendations

Format the response as JSON with this structure:
{
  "title": "Course title",
  "subject": "${subject}",
  "grade": ${grade},
  "duration": ${duration},
  "weeks": [
    {
      "week": 1,
      "topic": "Topic name",
      "content": "Detailed content description",
      "learning_objectives": ["objective 1", "objective 2"],
      "activities": ["activity 1", "activity 2"],
      "assessments": ["assessment 1"],
      "resources": ["resource 1", "resource 2"]
    }
  ]
}`;

    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🤖 Gemini: Generating curriculum structure... (Attempt ${attempt}/${maxRetries})`);
        
        const response = await fetch(this.baseURL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
            }
          })
        });

        const geminiData = await response.json();
        
        // Check for API errors
        if (!response.ok) {
          const errorMessage = geminiData.error?.message || 'Unknown API error';
          console.warn(`⚠️ Gemini API Error (Attempt ${attempt}): ${response.status} ${errorMessage}`);
          
          // If it's a rate limit or overload error, wait and retry
          if (response.status === 503 || response.status === 429) {
            if (attempt < maxRetries) {
              console.log(`⏳ Waiting ${retryDelay}ms before retry...`);
              await this.sleep(retryDelay * attempt); // Exponential backoff
              continue;
            }
          }
          
          throw new Error(`Gemini API Error: ${response.status} ${errorMessage}`);
        }

        const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        if (!text) {
          throw new Error('Empty response from Gemini API');
        }
        
        // Extract JSON from response
        let jsonText = text.trim();
        if (jsonText.includes('```json')) {
          jsonText = jsonText.split('```json')[1].split('```')[0].trim();
        } else if (jsonText.includes('```')) {
          jsonText = jsonText.split('```')[1].split('```')[0].trim();
        }

        const curriculum = JSON.parse(jsonText);
        console.log(`✅ Curriculum generated successfully on attempt ${attempt}`);
        return curriculum;

      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          // Last attempt failed, return fallback curriculum
          console.log('🔄 All retries failed, generating fallback curriculum...');
          return this.generateFallbackCurriculum(data);
        }
        
        // Wait before next retry
        if (attempt < maxRetries) {
          console.log(`⏳ Waiting ${retryDelay * attempt}ms before next attempt...`);
          await this.sleep(retryDelay * attempt);
        }
      }
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  generateFallbackCurriculum(data) {
    const { subject, grade, duration, syllabus } = data;
    
    console.log('📚 Generating fallback curriculum using local templates...');
    
    const weeklyTopics = this.generateWeeklyTopics(subject, duration);
    
    return {
      title: `${subject} Curriculum - Grade ${grade}`,
      subject: subject,
      grade: grade,
      duration: duration,
      weeks: weeklyTopics.map((topic, index) => ({
        week: index + 1,
        topic: topic,
        content: `Week ${index + 1} focuses on ${topic}. This includes theoretical understanding and practical applications.`,
        learning_objectives: [
          `Understand the fundamentals of ${topic}`,
          `Apply concepts learned in practical scenarios`,
          `Analyze and evaluate different approaches`
        ],
        activities: [
          `Interactive lecture on ${topic}`,
          `Hands-on practical exercises`,
          `Group discussion and problem-solving`
        ],
        assessments: [`Quiz on ${topic}`, `Practical assignment`],
        resources: [`Textbook chapters on ${topic}`, `Online resources and tutorials`]
      })),
      generatedBy: 'Fallback System',
      note: 'This curriculum was generated using fallback templates due to API limitations. Please review and customize as needed.'
    };
  }

  generateWeeklyTopics(subject, duration) {
    const topicTemplates = {
      'Computer Science': [
        'Introduction to Computer Science',
        'Programming Fundamentals',
        'Data Structures and Algorithms',
        'Object-Oriented Programming',
        'Database Systems',
        'Web Development Basics',
        'Software Engineering Principles',
        'Computer Networks',
        'Cybersecurity Fundamentals',
        'Artificial Intelligence Basics',
        'Mobile App Development',
        'Cloud Computing',
        'Version Control Systems',
        'Testing and Debugging',
        'Project Management',
        'Ethics in Technology'
      ],
      'Mathematics': [
        'Number Systems and Operations',
        'Algebra Fundamentals',
        'Linear Equations',
        'Quadratic Equations',
        'Functions and Graphs',
        'Trigonometry',
        'Statistics and Probability',
        'Geometry',
        'Calculus Introduction',
        'Mathematical Reasoning',
        'Problem Solving Strategies',
        'Mathematical Modeling',
        'Discrete Mathematics',
        'Mathematical Applications',
        'Review and Integration',
        'Advanced Topics'
      ],
      'Science': [
        'Scientific Method',
        'Matter and Energy',
        'Chemical Reactions',
        'Physics Fundamentals',
        'Biology Basics',
        'Earth Sciences',
        'Environmental Science',
        'Laboratory Techniques',
        'Data Analysis',
        'Scientific Communication',
        'Research Methods',
        'Technology in Science',
        'Science and Society',
        'Current Scientific Issues',
        'Science Project',
        'Science Fair Presentation'
      ]
    };

    const defaultTopics = [
      'Course Introduction and Overview',
      'Fundamental Concepts',
      'Basic Principles',
      'Intermediate Topics',
      'Advanced Concepts',
      'Practical Applications',
      'Problem Solving',
      'Case Studies',
      'Project Work',
      'Research and Analysis',
      'Presentation Skills',
      'Review and Assessment',
      'Integration and Synthesis',
      'Real-world Applications',
      'Final Projects',
      'Course Conclusion'
    ];

    const topics = topicTemplates[subject] || defaultTopics;
    
    // Adjust topics based on duration
    if (duration <= topics.length) {
      return topics.slice(0, duration);
    } else {
      // Extend with generic topics if needed
      const extended = [...topics];
      for (let i = topics.length; i < duration; i++) {
        extended.push(`Advanced Topic ${i - topics.length + 1}`);
      }
      return extended;
    }
  }

  async createLessonPlan(data) {
    const { topic, grade, duration } = data;
    
    const prompt = `Create a detailed lesson plan for "${topic}" for Grade ${grade} students.
    Duration: ${duration}
    
    Include:
    1. Learning objectives
    2. Materials needed
    3. Step-by-step activities
    4. Assessment methods
    5. Homework/follow-up activities
    
    Make it engaging and age-appropriate.`;

    try {
      console.log('🤖 Gemini: Creating detailed lesson plan...');
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2048,
          }
        })
      });

      const geminiData = await response.json();
      const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      return {
        topic,
        grade,
        duration,
        content: text,
        generatedBy: 'Gemini AI'
      };

    } catch (error) {
      console.error('Gemini lesson plan error:', error);
      throw error;
    }
  }

  async generateComplexQuestions(data) {
    const { topic, difficulty, questionCount, context } = data;
    
    const prompt = `Generate ${questionCount} ${difficulty} level questions about "${topic}".
    
    Context: ${context || 'General educational context'}
    
    Create diverse question types:
    - Scenario-based questions
    - Analytical questions
    - Creative application questions
    
    For each question, provide:
    1. The question text
    2. Multiple choice options (if applicable)
    3. Correct answer
    4. Detailed explanation
    
    Format as JSON array of question objects.`;

    try {
      console.log('🤖 Gemini: Creating complex questions...');
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 4096,
          }
        })
      });

      const geminiData = await response.json();
      const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Try to parse JSON response
      let questions = [];
      try {
        let jsonText = text.trim();
        if (jsonText.includes('```json')) {
          jsonText = jsonText.split('```json')[1].split('```')[0].trim();
        }
        questions = JSON.parse(jsonText);
      } catch (parseError) {
        // Fallback: create questions from text
        questions = this.parseQuestionsFromText(text, topic, difficulty);
      }

      return questions;

    } catch (error) {
      console.error('Gemini complex questions error:', error);
      throw error;
    }
  }

  parseQuestionsFromText(text, topic, difficulty) {
    const lines = text.split('\n').filter(line => line.trim());
    const questions = [];
    
    lines.forEach((line, index) => {
      if (line.includes('?')) {
        questions.push({
          id: `gemini-q-${index + 1}`,
          type: 'short-answer',
          question: line.trim(),
          correctAnswer: 'Detailed answer based on understanding of the topic',
          explanation: `This question tests advanced understanding of ${topic}`,
          difficulty: difficulty
        });
      }
    });

    return questions.slice(0, 5);
  }
}

class AIOrchestrator {
  constructor() {
    this.gemini = new GeminiService();
    this.huggingface = HuggingFaceService;
  }

  async distributeTask(taskType, data) {
    const taskMap = {
      // Gemini handles complex, creative tasks
      'curriculum-generation': () => this.gemini.generateCurriculum(data),
      'lesson-planning': () => this.gemini.createLessonPlan(data),
      'creative-content': () => this.gemini.generateCreativeContent(data),
      'complex-questions': () => this.gemini.generateComplexQuestions(data),
      
      // HuggingFace handles specialized, efficient tasks
      'question-generation': () => this.huggingface.generateQuestions(data.context, data.model),
      'text-summarization': () => this.huggingface.summarizeContent(data.text, data.model),
      'content-classification': () => this.huggingface.classifyContent(data.text, data.model),
      'translation': () => this.huggingface.translateContent(data.text, data.targetLang, data.model),
      'educational-content': () => this.huggingface.generateEducationalContent(data.prompt, data.model)
    };

    if (!taskMap[taskType]) {
      throw new Error(`Unknown task type: ${taskType}`);
    }

    return await taskMap[taskType]();
  }

  // Performance monitoring
  async executeWithMonitoring(service, taskType, data) {
    const startTime = Date.now();
    
    try {
      console.log(`📊 Starting ${taskType} with ${service}...`);
      const result = await this.distributeTask(taskType, data);
      const duration = Date.now() - startTime;
      console.log(`✅ ${taskType} completed in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ ${taskType} failed after ${duration}ms:`, error.message);
      throw error;
    }
  }

  // Health check for all services
  async healthCheck() {
    const results = {
      timestamp: new Date().toISOString(),
      services: {}
    };

    // Check HuggingFace
    try {
      results.services.huggingface = await this.huggingface.healthCheck();
    } catch (error) {
      results.services.huggingface = {
        status: 'error',
        message: 'HuggingFace health check failed',
        error: error.message
      };
    }

    // Check Gemini
    try {
      await this.gemini.generateCurriculum({
        subject: 'Test',
        grade: 10,
        duration: 1,
        syllabus: 'Test syllabus'
      });
      results.services.gemini = {
        status: 'healthy',
        message: 'Gemini service is operational'
      };
    } catch (error) {
      results.services.gemini = {
        status: 'error',
        message: 'Gemini service is not available',
        error: error.message
      };
    }

    return results;
  }
}

export default new AIOrchestrator();
