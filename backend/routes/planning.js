
import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();

// Generate teaching plan endpoint
router.post('/generate-plan', async (req, res) => {
  try {
    const { syllabus, subject, grade, duration } = req.body;

    // Validation
    if (!syllabus || !subject || !grade || !duration) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['syllabus', 'subject', 'grade', 'duration']
      });
    }

    if (parseInt(duration) < 1 || parseInt(duration) > 52) {
      return res.status(400).json({
        error: 'Duration must be between 1 and 52 weeks'
      });
    }

    console.log(`🎯 Generating plan for ${subject}, Grade ${grade}, ${duration} weeks`);

    // Create the prompt for Gemini
    const prompt = `You are an expert educational AI assistant helping teachers create comprehensive semester plans.

Please analyze the following syllabus and generate a structured JSON response for a ${duration}-week ${subject} course for grade ${grade}:

SYLLABUS:
${syllabus}

Generate a JSON response with the following structure:
{
  "semester_plan": [
    {
      "week": 1,
      "topics": "Specific topic for this week",
      "activities": "Detailed learning activities and teaching methods"
    }
  ],
  "lesson_aids": [
    "List of specific teaching aids, resources, and materials"
  ],
  "assessments": [
    "List of assessments with timing and type"
  ]
}

Requirements:
1. Create detailed week-by-week breakdown for all ${duration} weeks
2. Include diverse, engaging activities for each week
3. Suggest practical lesson aids (PPT topics, videos, worksheets, hands-on activities)
4. Plan assessments strategically throughout the semester
5. Ensure content is appropriate for grade ${grade}
6. Make activities progressive and build upon previous weeks

Return ONLY the JSON object, no additional text.`;

    // Generate plan using Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('🔑 API Key exists:', !!apiKey);

    console.log('🌐 Making request to Gemini API...');
    const geminiRes = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      })
    });
    
    console.log('📡 Gemini API response status:', geminiRes.status);
    const geminiData = await geminiRes.json();
    console.log('🔍 Gemini API response:', JSON.stringify(geminiData, null, 2));
    
    // Parse Gemini response
    let teachingPlan = {};
    try {
      const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log('📝 Extracted text:', text);
      
      // Extract JSON from markdown code block if present
      let jsonText = text;
      if (text.includes('```json')) {
        const startIndex = text.indexOf('```json') + 7;
        const endIndex = text.lastIndexOf('```');
        jsonText = text.substring(startIndex, endIndex).trim();
        console.log('🔧 Extracted JSON from markdown:', jsonText.substring(0, 200) + '...');
      }
      
      teachingPlan = JSON.parse(jsonText);
      
      // Ensure assessments are in the correct format (array of strings)
      if (teachingPlan.assessments && Array.isArray(teachingPlan.assessments)) {
        teachingPlan.assessments = teachingPlan.assessments.map(assessment => {
          if (typeof assessment === 'object' && assessment.type) {
            return `${assessment.type} (${assessment.timing}): ${assessment.description}`;
          }
          return assessment.toString();
        });
      }
      
      console.log('🎉 Successfully parsed teaching plan with', teachingPlan.semester_plan?.length, 'weeks');
    } catch (e) {
      console.error('❌ JSON Parse Error:', e);
      return res.status(500).json({ error: 'Failed to parse Gemini response', details: geminiData });
    }

    // Add metadata
    const response = {
      ...teachingPlan,
      metadata: {
        subject,
        grade,
        duration: parseInt(duration),
        generated_at: new Date().toISOString(),
        total_weeks: teachingPlan.semester_plan.length
      }
    };

    console.log(`✅ Successfully generated plan with ${response.metadata.total_weeks} weeks`);

    res.json(response);
  } catch (error) {
    console.error('Error generating teaching plan:', error);
    res.status(500).json({
      error: 'Failed to generate teaching plan',
      message: error.message
    });
  }
});

// Test endpoint for hackathon demo
router.get('/test', (req, res) => {
  res.json({
    message: 'Planning API is working!',
    endpoints: {
      generate_plan: 'POST /api/planning/generate-plan',
      generate_quiz: 'POST /api/planning/generate-quiz',
      test: 'GET /api/planning/test'
    }
  });
});

// Generate quiz endpoint
router.post('/generate-quiz', async (req, res) => {
  try {
    const { topic, week, difficulty = 'Medium', questionCount = 10, teachingPlan } = req.body;

    console.log(`🧠 Generating AI-powered quiz for Week ${week}: ${topic}`);
    console.log(`📊 Difficulty: ${difficulty}, Questions: ${questionCount}`);

    // Use AI to generate dynamic questions based on the teaching plan content
    const quiz = await generateAIQuiz(topic, week, difficulty, questionCount, teachingPlan);

    console.log(`✅ Successfully generated AI quiz with ${quiz.questions.length} questions`);
    res.json(quiz);
  } catch (error) {
    console.error('Error generating quiz:', error);
    
    // Fallback to sample questions if AI fails
    console.log('🔄 Falling back to sample questions...');
    try {
      const fallbackQuiz = {
        id: `quiz-fallback-${week}-${Date.now()}`,
        week: parseInt(week),
        topic,
        difficulty,
        questionCount,
        duration: Math.max(15, questionCount * 2),
        totalPoints: questionCount * 10,
        generated_at: new Date().toISOString(),
        questions: generateSampleQuestions(topic, week, difficulty, questionCount)
      };
      
      res.json(fallbackQuiz);
    } catch (fallbackError) {
      res.status(500).json({
        error: 'Failed to generate quiz',
        message: error.message
      });
    }
  }
});

async function generateAIQuiz(topic, week, difficulty, questionCount, teachingPlan) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  // Create a detailed prompt for quiz generation
  const prompt = `Generate a comprehensive quiz for Week ${week} of a teaching plan.

TOPIC: ${topic}
DIFFICULTY: ${difficulty}
NUMBER OF QUESTIONS: ${questionCount}

TEACHING PLAN CONTEXT:
${teachingPlan ? JSON.stringify(teachingPlan, null, 2) : 'No specific teaching plan provided'}

REQUIREMENTS:
1. Generate exactly ${questionCount} unique questions
2. Mix question types: multiple-choice, true-false, and short-answer
3. All questions must be directly related to "${topic}"
4. Difficulty level should be "${difficulty}"
5. Include 4 realistic options for multiple-choice questions
6. Provide detailed explanations for each answer
7. Ensure no duplicate or similar questions

OUTPUT FORMAT (JSON only, no markdown):
{
  "id": "quiz-${week}-${Date.now()}",
  "week": ${week},
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "questionCount": ${questionCount},
  "duration": ${Math.max(15, questionCount * 2)},
  "totalPoints": ${questionCount * 10},
  "generated_at": "${new Date().toISOString()}",
  "questions": [
    {
      "id": "q-${week}-1",
      "type": "multiple-choice",
      "question": "Specific question about ${topic}",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": "Option 1",
      "explanation": "Detailed explanation why this is correct",
      "difficulty": "${difficulty}",
      "points": 10
    }
  ]
}

Generate diverse, educational questions that test understanding of ${topic} concepts.`;

  try {
    console.log('🌐 Making request to Gemini API for quiz generation...');
    const geminiRes = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      })
    });

    console.log('📡 Gemini API response status:', geminiRes.status);
    const geminiData = await geminiRes.json();
    
    if (!geminiRes.ok) {
      throw new Error(`Gemini API error: ${geminiData.error?.message || 'Unknown error'}`);
    }

    // Parse Gemini response
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('🔍 Gemini raw response:', text);

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = text.trim();
    if (jsonText.includes('```json')) {
      jsonText = jsonText.split('```json')[1].split('```')[0].trim();
    } else if (jsonText.includes('```')) {
      jsonText = jsonText.split('```')[1].split('```')[0].trim();
    }

    try {
      const quizData = JSON.parse(jsonText);
      
      // Validate the structure
      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        throw new Error('Invalid quiz structure from AI');
      }

      console.log('✅ Successfully parsed AI-generated quiz');
      return quizData;
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Invalid JSON response from AI');
    }

  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

function generateSampleQuestions(topic, week, difficulty, count) {
  const questions = [];
  const topicLower = topic.toLowerCase();
  
  // Comprehensive question pools for different topics
  const questionPools = {
    algorithm: [
      {
        type: 'multiple-choice',
        question: 'What is the time complexity of linear search in the worst case?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        correctAnswer: 'O(n)',
        explanation: 'Linear search checks each element sequentially, so worst case is O(n).'
      },
      {
        type: 'multiple-choice',
        question: 'Which sorting algorithm has the best average-case time complexity?',
        options: ['Bubble Sort', 'Quick Sort', 'Insertion Sort', 'Selection Sort'],
        correctAnswer: 'Quick Sort',
        explanation: 'Quick Sort has O(n log n) average case, making it very efficient.'
      },
      {
        type: 'true-false',
        question: 'Binary search can only be applied to sorted arrays.',
        correctAnswer: 'True',
        explanation: 'Binary search requires the array to be sorted to work correctly.'
      },
      {
        type: 'multiple-choice',
        question: 'What is the space complexity of merge sort?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        correctAnswer: 'O(n)',
        explanation: 'Merge sort requires additional space proportional to the input size.'
      },
      {
        type: 'short-answer',
        question: 'Explain the difference between stable and unstable sorting algorithms.',
        correctAnswer: 'Stable sorting maintains the relative order of equal elements, unstable sorting does not.',
        explanation: 'Stability is important when sorting objects with multiple keys.'
      }
    ],
    python: [
      {
        type: 'multiple-choice',
        question: 'Which of the following is a mutable data type in Python?',
        options: ['tuple', 'string', 'list', 'int'],
        correctAnswer: 'list',
        explanation: 'Lists can be modified after creation, making them mutable.'
      },
      {
        type: 'multiple-choice',
        question: 'What does the len() function return for an empty string?',
        options: ['None', '0', '1', 'Error'],
        correctAnswer: '0',
        explanation: 'len() returns the number of characters, which is 0 for an empty string.'
      },
      {
        type: 'true-false',
        question: 'Python is a statically typed language.',
        correctAnswer: 'False',
        explanation: 'Python is dynamically typed - variable types are determined at runtime.'
      },
      {
        type: 'multiple-choice',
        question: 'Which keyword is used to define a function in Python?',
        options: ['function', 'def', 'func', 'define'],
        correctAnswer: 'def',
        explanation: 'The "def" keyword is used to define functions in Python.'
      },
      {
        type: 'short-answer',
        question: 'What is the output of: print(type([1, 2, 3]))?',
        correctAnswer: "<class 'list'>",
        explanation: 'The type() function returns the class type of the object.'
      }
    ],
    database: [
      {
        type: 'multiple-choice',
        question: 'Which SQL command is used to retrieve data?',
        options: ['INSERT', 'UPDATE', 'SELECT', 'DELETE'],
        correctAnswer: 'SELECT',
        explanation: 'SELECT is used to query and retrieve data from database tables.'
      },
      {
        type: 'multiple-choice',
        question: 'What does ACID stand for in database systems?',
        options: ['Atomicity, Consistency, Isolation, Durability', 'Access, Control, Identity, Data', 'Advanced, Concurrent, Independent, Database', 'Automatic, Calculated, Indexed, Distributed'],
        correctAnswer: 'Atomicity, Consistency, Isolation, Durability',
        explanation: 'ACID properties ensure reliable database transactions.'
      },
      {
        type: 'true-false',
        question: 'A primary key can contain NULL values.',
        correctAnswer: 'False',
        explanation: 'Primary keys must be unique and cannot contain NULL values.'
      },
      {
        type: 'multiple-choice',
        question: 'Which type of JOIN returns only matching records from both tables?',
        options: ['LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL OUTER JOIN'],
        correctAnswer: 'INNER JOIN',
        explanation: 'INNER JOIN returns only records that have matching values in both tables.'
      },
      {
        type: 'short-answer',
        question: 'What is normalization in database design?',
        correctAnswer: 'The process of organizing data to reduce redundancy and improve data integrity.',
        explanation: 'Normalization helps eliminate data redundancy and maintain consistency.'
      }
    ],
    web: [
      {
        type: 'true-false',
        question: 'HTML stands for HyperText Markup Language.',
        correctAnswer: 'True',
        explanation: 'HTML is indeed HyperText Markup Language, used for web pages.'
      },
      {
        type: 'multiple-choice',
        question: 'Which CSS property is used to change text color?',
        options: ['font-color', 'text-color', 'color', 'foreground-color'],
        correctAnswer: 'color',
        explanation: 'The "color" property sets the text color in CSS.'
      },
      {
        type: 'multiple-choice',
        question: 'What does DOM stand for?',
        options: ['Document Object Model', 'Data Object Management', 'Dynamic Object Mapping', 'Document Oriented Model'],
        correctAnswer: 'Document Object Model',
        explanation: 'DOM represents the structure of HTML documents as objects.'
      },
      {
        type: 'true-false',
        question: 'JavaScript and Java are the same programming language.',
        correctAnswer: 'False',
        explanation: 'JavaScript and Java are completely different languages despite similar names.'
      },
      {
        type: 'short-answer',
        question: 'What is the purpose of the <head> tag in HTML?',
        correctAnswer: 'Contains metadata about the document that is not displayed on the page.',
        explanation: 'The head section includes title, meta tags, links to stylesheets, etc.'
      }
    ],
    oop: [
      {
        type: 'multiple-choice',
        question: 'What is encapsulation in Object-Oriented Programming?',
        options: ['Creating multiple objects', 'Hiding internal implementation details', 'Inheriting from parent classes', 'Overriding methods'],
        correctAnswer: 'Hiding internal implementation details',
        explanation: 'Encapsulation bundles data and methods while hiding internal details.'
      },
      {
        type: 'true-false',
        question: 'Inheritance allows a class to inherit properties from multiple parent classes in all OOP languages.',
        correctAnswer: 'False',
        explanation: 'Some languages support multiple inheritance, others (like Java) support only single inheritance.'
      },
      {
        type: 'multiple-choice',
        question: 'Which OOP principle allows treating objects of different classes uniformly?',
        options: ['Encapsulation', 'Inheritance', 'Polymorphism', 'Abstraction'],
        correctAnswer: 'Polymorphism',
        explanation: 'Polymorphism allows objects of different types to be treated as instances of the same type.'
      },
      {
        type: 'short-answer',
        question: 'What is the difference between a class and an object?',
        correctAnswer: 'A class is a blueprint or template, while an object is an instance of a class.',
        explanation: 'Classes define structure and behavior; objects are actual instances with specific values.'
      }
    ]
  };

  // Determine the most relevant question pool
  let selectedPool = questionPools.python; // default
  if (topicLower.includes('algorithm') || topicLower.includes('sorting') || topicLower.includes('search')) {
    selectedPool = questionPools.algorithm;
  } else if (topicLower.includes('database') || topicLower.includes('sql')) {
    selectedPool = questionPools.database;
  } else if (topicLower.includes('web') || topicLower.includes('html') || topicLower.includes('css') || topicLower.includes('javascript')) {
    selectedPool = questionPools.web;
  } else if (topicLower.includes('object') || topicLower.includes('oop') || topicLower.includes('class')) {
    selectedPool = questionPools.oop;
  } else if (topicLower.includes('python') || topicLower.includes('programming')) {
    selectedPool = questionPools.python;
  }

  // Shuffle the pool and select unique questions
  const shuffledPool = [...selectedPool].sort(() => Math.random() - 0.5);
  
  // If we need more questions than available in the pool, add some general questions
  while (shuffledPool.length < count) {
    shuffledPool.push({
      type: 'short-answer',
      question: `Describe a practical application of the concepts learned in "${topic}".`,
      correctAnswer: `The concepts in ${topic} can be applied in various real-world scenarios depending on the specific domain and requirements.`,
      explanation: `Understanding practical applications helps reinforce theoretical knowledge of ${topic}.`
    });
  }

  // Generate the requested number of questions
  for (let i = 0; i < count && i < shuffledPool.length; i++) {
    const baseQuestion = shuffledPool[i];
    const question = {
      id: `q-${week}-${i + 1}`,
      type: baseQuestion.type,
      question: baseQuestion.question,
      correctAnswer: baseQuestion.correctAnswer,
      explanation: baseQuestion.explanation,
      difficulty: difficulty,
      points: 10
    };

    // Add options for multiple-choice questions
    if (baseQuestion.type === 'multiple-choice' && baseQuestion.options) {
      question.options = [...baseQuestion.options];
    }

    questions.push(question);
  }
  
  return questions;
}

export default router;