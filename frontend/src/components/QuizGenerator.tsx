import React, { useState } from 'react';
import { Brain, Play, Download, RefreshCw, CheckCircle, Clock, Star, Target } from 'lucide-react';
import { TeachingPlan } from '../types';

interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface Quiz {
  id: string;
  week: number;
  topic: string;
  questions: Question[];
  duration: number; // in minutes
  totalPoints: number;
}

interface Props {
  teachingPlan: TeachingPlan;
  onQuizSubmit?: () => void;
}

const QuizGenerator: React.FC<Props> = ({ teachingPlan, onQuizSubmit }) => {
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [error, setError] = useState<string>('');
  
  // Quiz-taking state
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0, percentage: 0 });

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      const selectedWeekData = teachingPlan.semester_plan.find(w => w.week === selectedWeek);
      if (!selectedWeekData) {
        throw new Error('Selected week not found');
      }

      try {
        // Try to call backend API first
        const response = await fetch('http://localhost:3000/api/planning/generate-quiz', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topic: selectedWeekData.topics,
            week: selectedWeek,
            difficulty,
            questionCount,
            teachingPlan: teachingPlan // Send the full teaching plan for context
          })
        });

        if (response.ok) {
          const quizData = await response.json();
          
          const quiz: Quiz = {
            id: quizData.id,
            week: selectedWeek,
            topic: selectedWeekData.topics,
            questions: quizData.questions.map((q: any) => ({
              id: q.id,
              type: q.type,
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              difficulty: q.difficulty
            })),
            duration: quizData.duration,
            totalPoints: quizData.totalPoints
          };

          setGeneratedQuiz(quiz);
          console.log('✅ Quiz generated successfully from AI backend:', quiz);
          
          // Reset quiz state when new quiz is generated
          setIsQuizMode(true);
          setUserAnswers({});
          setQuizSubmitted(false);
          setQuizScore({ correct: 0, total: 0, percentage: 0 });
          
          return;
        }
      } catch (backendError) {
        console.warn('AI backend not available, generating quiz locally:', backendError);
      }

      // Fallback to local generation
      console.log('📝 Generating quiz locally...');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing time

      const localQuestions = generateLocalQuestions(selectedWeekData.topics, selectedWeek);
      
      const quiz: Quiz = {
        id: `quiz-local-${selectedWeek}-${Date.now()}`,
        week: selectedWeek,
        topic: selectedWeekData.topics,
        questions: localQuestions,
        duration: Math.max(15, localQuestions.length * 2),
        totalPoints: localQuestions.length * 10
      };

      setGeneratedQuiz(quiz);
      console.log('✅ Quiz generated locally:', quiz);
      
      // Reset quiz state when new quiz is generated
      setIsQuizMode(true);
      setUserAnswers({});
      setQuizSubmitted(false);
      setQuizScore({ correct: 0, total: 0, percentage: 0 });
    } catch (err) {
      console.error('❌ Error generating quiz:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate quiz');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    if (!quizSubmitted) {
      setUserAnswers(prev => ({
        ...prev,
        [questionId]: answer
      }));
    }
  };

  const handleSubmitQuiz = () => {
    if (!generatedQuiz) return;

    // Calculate score
    let correctCount = 0;
    generatedQuiz.questions.forEach(question => {
      const userAnswer = userAnswers[question.id];
      if (userAnswer && userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) {
        correctCount++;
      }
    });

    const total = generatedQuiz.questions.length;
    const percentage = Math.round((correctCount / total) * 100);

    setQuizScore({
      correct: correctCount,
      total,
      percentage
    });
    setQuizSubmitted(true);

    // Save results to localStorage for Adaptive Learning
    const quizResult = {
      week: generatedQuiz.week,
      score: correctCount,
      total,
      percentage,
      correctAnswers: correctCount,
      wrongAnswers: total - correctCount,
      topics: generatedQuiz.topic,
      date: new Date().toISOString(),
      questions: generatedQuiz.questions.map(q => ({
        question: q.question,
        userAnswer: userAnswers[q.id] || '',
        correctAnswer: q.correctAnswer,
        isCorrect: userAnswers[q.id]?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
      }))
    };

    // Get existing results and add new one
    const existingResults = localStorage.getItem('quizResults');
    const results = existingResults ? JSON.parse(existingResults) : [];
    results.push(quizResult);
    localStorage.setItem('quizResults', JSON.stringify(results));

    console.log('✅ Quiz submitted! Score:', percentage + '%');
    console.log('📊 Results saved to localStorage for Adaptive Learning');
    
    // Redirect to Adaptive Learning tab after a short delay to show the score
    setTimeout(() => {
      if (onQuizSubmit) {
        onQuizSubmit();
      }
    }, 3000); // 3 second delay to let user see their score
  };

  const handleRetakeQuiz = () => {
    setUserAnswers({});
    setQuizSubmitted(false);
    setQuizScore({ correct: 0, total: 0, percentage: 0 });
    setIsQuizMode(true);
  };

  const handleViewAnswers = () => {
    setIsQuizMode(false);
  };

  const generateLocalQuestions = (topic: string, week: number): Question[] => {
    const topicLower = topic.toLowerCase();
    
    // Comprehensive question pools with real alternatives
    const questionSets = {
      python: [
        {
          type: 'multiple-choice' as const,
          question: 'Which of the following is a mutable data type in Python?',
          options: ['tuple', 'string', 'list', 'frozenset'],
          correctAnswer: 'list',
          explanation: 'Lists can be modified after creation, making them mutable unlike tuples and strings.',
          difficulty: difficulty
        },
        {
          type: 'multiple-choice' as const,
          question: 'What is the correct way to define a function in Python?',
          options: ['function myFunc():', 'def myFunc():', 'func myFunc():', 'define myFunc():'],
          correctAnswer: 'def myFunc():',
          explanation: 'Python uses the "def" keyword followed by the function name and parentheses.',
          difficulty: difficulty
        },
        {
          type: 'true-false' as const,
          question: 'Python is a statically typed language.',
          correctAnswer: 'False',
          explanation: 'Python is dynamically typed - variable types are determined at runtime.',
          difficulty: difficulty
        }
      ],
      algorithm: [
        {
          type: 'multiple-choice' as const,
          question: 'What is the time complexity of binary search?',
          options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
          correctAnswer: 'O(log n)',
          explanation: 'Binary search eliminates half of the remaining elements in each step.',
          difficulty: difficulty
        },
        {
          type: 'multiple-choice' as const,
          question: 'Which sorting algorithm has the best average-case time complexity?',
          options: ['Bubble Sort', 'Quick Sort', 'Insertion Sort', 'Selection Sort'],
          correctAnswer: 'Quick Sort',
          explanation: 'Quick Sort has O(n log n) average case complexity.',
          difficulty: difficulty
        },
        {
          type: 'true-false' as const,
          question: 'Merge sort is a stable sorting algorithm.',
          correctAnswer: 'True',
          explanation: 'Merge sort maintains the relative order of equal elements.',
          difficulty: difficulty
        }
      ],
      database: [
        {
          type: 'multiple-choice' as const,
          question: 'Which SQL command is used to retrieve data?',
          options: ['INSERT', 'UPDATE', 'SELECT', 'DELETE'],
          correctAnswer: 'SELECT',
          explanation: 'SELECT is used to query and retrieve data from database tables.',
          difficulty: difficulty
        },
        {
          type: 'multiple-choice' as const,
          question: 'What does ACID stand for in databases?',
          options: ['Access Control Identity Data', 'Atomicity Consistency Isolation Durability', 'Advanced Concurrent Independent Database', 'Automatic Calculated Indexed Distributed'],
          correctAnswer: 'Atomicity Consistency Isolation Durability',
          explanation: 'ACID properties ensure reliable database transactions.',
          difficulty: difficulty
        },
        {
          type: 'true-false' as const,
          question: 'A primary key can contain NULL values.',
          correctAnswer: 'False',
          explanation: 'Primary keys must be unique and cannot contain NULL values.',
          difficulty: difficulty
        }
      ],
      web: [
        {
          type: 'multiple-choice' as const,
          question: 'Which CSS property changes text color?',
          options: ['font-color', 'text-color', 'color', 'foreground-color'],
          correctAnswer: 'color',
          explanation: 'The "color" property sets the text color in CSS.',
          difficulty: difficulty
        },
        {
          type: 'multiple-choice' as const,
          question: 'What does DOM stand for?',
          options: ['Document Object Model', 'Data Object Management', 'Dynamic Object Mapping', 'Document Oriented Model'],
          correctAnswer: 'Document Object Model',
          explanation: 'DOM represents the structure of HTML documents as objects.',
          difficulty: difficulty
        },
        {
          type: 'true-false' as const,
          question: 'JavaScript and Java are the same programming language.',
          correctAnswer: 'False',
          explanation: 'JavaScript and Java are completely different languages.',
          difficulty: difficulty
        }
      ]
    };

    // Determine the most relevant question set
    let selectedQuestions = questionSets.python; // default
    if (topicLower.includes('algorithm') || topicLower.includes('sorting') || topicLower.includes('search')) {
      selectedQuestions = questionSets.algorithm;
    } else if (topicLower.includes('database') || topicLower.includes('sql')) {
      selectedQuestions = questionSets.database;
    } else if (topicLower.includes('web') || topicLower.includes('html') || topicLower.includes('css')) {
      selectedQuestions = questionSets.web;
    }

    // Shuffle and select unique questions
    const shuffledQuestions = [...selectedQuestions].sort(() => Math.random() - 0.5);
    
    // Add topic-specific questions if needed
    const baseQuestions: Question[] = shuffledQuestions.slice(0, Math.min(questionCount - 2, shuffledQuestions.length))
      .map((q, index) => ({
        ...q,
        id: `q-${week}-${index + 1}`
      }));
    
    // Add some general questions
    baseQuestions.push({
      id: `q-${week}-${baseQuestions.length + 1}`,
      type: 'multiple-choice',
      question: `What is the main learning objective for Week ${week}: "${topic}"?`,
      options: [
        'Memorizing syntax and rules',
        'Understanding concepts and applications',
        'Copying code examples',
        'Reading documentation only'
      ],
      correctAnswer: 'Understanding concepts and applications',
      explanation: `Effective learning focuses on understanding both theory and practical applications of ${topic}.`,
      difficulty: difficulty
    });

    if (baseQuestions.length < questionCount) {
      baseQuestions.push({
        id: `q-${week}-${baseQuestions.length + 1}`,
        type: 'short-answer',
        question: `Describe one practical application of the concepts learned in "${topic}".`,
        correctAnswer: `The concepts in ${topic} can be applied in software development, problem-solving, and real-world project implementation.`,
        explanation: `Understanding practical applications helps reinforce theoretical knowledge of ${topic}.`,
        difficulty: difficulty
      });
    }

    // Add more questions if needed
    while (baseQuestions.length < questionCount) {
      baseQuestions.push({
        id: `q-${week}-${baseQuestions.length + 1}`,
        type: 'true-false',
        question: `Mastering ${topic} requires both theoretical understanding and hands-on practice.`,
        correctAnswer: 'True',
        explanation: 'Effective learning combines theory with practical application.',
        difficulty: difficulty
      });
    }

    return baseQuestions.slice(0, questionCount);
  };

  const exportQuiz = () => {
    if (!generatedQuiz) return;

    const quizContent = `
QUIZ: Week ${generatedQuiz.week} - ${generatedQuiz.topic}
Duration: ${generatedQuiz.duration} minutes
Total Points: ${generatedQuiz.totalPoints}

QUESTIONS:
${generatedQuiz.questions.map((q, index) => `
${index + 1}. ${q.question} (${q.difficulty})
${q.type === 'multiple-choice' && q.options ? 
  q.options.map((option, i) => `   ${String.fromCharCode(65 + i)}. ${option}`).join('\n') :
  q.type === 'true-false' ? '   A. True\n   B. False' : '   [Short Answer]'
}

Correct Answer: ${q.correctAnswer}
Explanation: ${q.explanation}
`).join('\n')}
    `;

    const blob = new Blob([quizContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Week_${generatedQuiz.week}_Quiz.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple-choice': return '📝';
      case 'true-false': return '✓';
      case 'short-answer': return '💭';
      default: return '❓';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Brain className="h-6 w-6 text-purple-600" />
        <h3 className="text-xl font-bold text-gray-900">AI Quiz Generator</h3>
        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          AI-POWERED
        </span>
      </div>

      {/* Quiz Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Week
          </label>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            {teachingPlan.semester_plan.map((week) => (
              <option key={week.week} value={week.week}>
                Week {week.week}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard')}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Questions
          </label>
          <select
            value={questionCount}
            onChange={(e) => setQuestionCount(parseInt(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value={5}>5 Questions</option>
            <option value={10}>10 Questions</option>
            <option value={15}>15 Questions</option>
            <option value={20}>20 Questions</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleGenerateQuiz}
            disabled={isGenerating}
            className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>{isGenerating ? 'Generating...' : 'Generate Quiz'}</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <div className="text-red-600">⚠️</div>
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Selected Week Topic */}
      {selectedWeek && (
        <div className="bg-purple-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-purple-900 mb-2">
            Week {selectedWeek} Topic:
          </h4>
          <p className="text-purple-700 text-sm">
            {teachingPlan.semester_plan.find(w => w.week === selectedWeek)?.topics}
          </p>
        </div>
      )}

      {/* Generated Quiz Display */}
      {generatedQuiz && (
        <div className="space-y-6">
          {/* Quiz Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xl font-bold">Quiz: Week {generatedQuiz.week}</h4>
                <p className="text-purple-100">{generatedQuiz.topic}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{generatedQuiz.duration} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4" />
                    <span>{generatedQuiz.totalPoints} pts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quiz Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="font-semibold text-gray-900">
                {quizSubmitted ? 'Quiz Results' : `Questions (${generatedQuiz.questions.length})`}
              </h5>
              {!quizSubmitted && isQuizMode ? (
                <div className="text-sm text-gray-600">
                  {Object.keys(userAnswers).length} of {generatedQuiz.questions.length} answered
                </div>
              ) : (
                <button
                  onClick={exportQuiz}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Quiz</span>
                </button>
              )}
            </div>

            {/* Quiz Score Display (after submission) */}
            {quizSubmitted && (
              <div className={`rounded-lg p-6 text-center ${
                quizScore.percentage >= 80 ? 'bg-green-50 border-2 border-green-500' :
                quizScore.percentage >= 60 ? 'bg-yellow-50 border-2 border-yellow-500' :
                'bg-red-50 border-2 border-red-500'
              }`}>
                <div className="text-6xl font-bold mb-2" style={{
                  color: quizScore.percentage >= 80 ? '#10b981' :
                         quizScore.percentage >= 60 ? '#f59e0b' : '#ef4444'
                }}>
                  {quizScore.percentage}%
                </div>
                <div className="text-xl font-semibold mb-2">
                  {quizScore.percentage >= 80 ? '🎉 Excellent!' :
                   quizScore.percentage >= 60 ? '👍 Good Job!' : '📚 Keep Practicing!'}
                </div>
                <div className="text-gray-700">
                  You got {quizScore.correct} out of {quizScore.total} questions correct
                </div>
                
                {/* Redirect notification */}
                <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
                  <p className="text-blue-800 text-sm font-medium">
                    🎯 Redirecting to Adaptive Learning in 3 seconds...
                  </p>
                  <p className="text-blue-600 text-xs mt-1">
                    Get personalized recommendations based on your performance!
                  </p>
                </div>
                
                <div className="mt-4 flex justify-center space-x-3">
                  <button
                    onClick={() => onQuizSubmit && onQuizSubmit()}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors font-semibold shadow-lg"
                  >
                    <Target className="h-4 w-4" />
                    <span>View My Performance</span>
                  </button>
                  <button
                    onClick={handleRetakeQuiz}
                    className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Retake Quiz</span>
                  </button>
                  <button
                    onClick={handleViewAnswers}
                    className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Review Answers</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quiz Questions - Interactive Mode or Review Mode */}
            {generatedQuiz.questions.map((question, index) => (
              <div key={question.id} className={`border rounded-lg p-4 ${
                quizSubmitted && userAnswers[question.id]?.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()
                  ? 'border-green-500 bg-green-50'
                  : quizSubmitted && userAnswers[question.id]
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <span className={`text-sm font-medium px-3 py-1 rounded ${
                      quizSubmitted && userAnswers[question.id]?.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()
                        ? 'bg-green-600 text-white'
                        : quizSubmitted && userAnswers[question.id]
                        ? 'bg-red-600 text-white'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      Q{index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{question.question}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-lg">{getQuestionTypeIcon(question.type)}</span>
                        <span className="text-xs text-gray-500 capitalize">{question.type.replace('-', ' ')}</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">10 pts</span>
                </div>

                {/* Multiple Choice Options */}
                {question.type === 'multiple-choice' && question.options && (
                  <div className="ml-12 space-y-2">
                    {question.options.map((option, optIndex) => {
                      const isSelected = userAnswers[question.id] === option;
                      const isCorrect = option === question.correctAnswer;
                      const showCorrect = quizSubmitted; // Only show correct answers after submission
                      
                      return (
                        <label
                          key={optIndex}
                          className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            showCorrect && isCorrect ? 'bg-green-100 border-2 border-green-500' :
                            quizSubmitted && isSelected && !isCorrect ? 'bg-red-100 border-2 border-red-500' :
                            isSelected ? 'bg-purple-100 border-2 border-purple-500' :
                            'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={question.id}
                            value={option}
                            checked={isSelected}
                            onChange={(e) => handleAnswerSelect(question.id, e.target.value)}
                            disabled={quizSubmitted}
                            className="h-4 w-4 text-purple-600"
                          />
                          <span className="text-sm text-gray-700 flex-1">
                            {String.fromCharCode(65 + optIndex)}. {option}
                          </span>
                          {showCorrect && isCorrect && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* True/False Options */}
                {question.type === 'true-false' && (
                  <div className="ml-12 space-y-2">
                    {['True', 'False'].map((option, optIndex) => {
                      const isSelected = userAnswers[question.id] === option;
                      const isCorrect = option === question.correctAnswer;
                      const showCorrect = quizSubmitted; // Only show correct answers after submission
                      
                      return (
                        <label
                          key={optIndex}
                          className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            showCorrect && isCorrect ? 'bg-green-100 border-2 border-green-500' :
                            quizSubmitted && isSelected && !isCorrect ? 'bg-red-100 border-2 border-red-500' :
                            isSelected ? 'bg-purple-100 border-2 border-purple-500' :
                            'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={question.id}
                            value={option}
                            checked={isSelected}
                            onChange={(e) => handleAnswerSelect(question.id, e.target.value)}
                            disabled={quizSubmitted}
                            className="h-4 w-4 text-purple-600"
                          />
                          <span className="text-sm text-gray-700 flex-1">
                            {String.fromCharCode(65 + optIndex)}. {option}
                          </span>
                          {showCorrect && isCorrect && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Short Answer */}
                {question.type === 'short-answer' && (
                  <div className="ml-12">
                    <textarea
                      value={userAnswers[question.id] || ''}
                      onChange={(e) => handleAnswerSelect(question.id, e.target.value)}
                      disabled={quizSubmitted}
                      placeholder="Type your answer here..."
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
                      rows={3}
                    />
                  </div>
                )}

                {/* Show explanation after submission only */}
                {quizSubmitted && (
                  <div className="ml-12 mt-3">
                    {userAnswers[question.id] && (
                      <div className={`p-3 rounded mb-2 ${
                        userAnswers[question.id]?.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        <strong>Your answer:</strong> {userAnswers[question.id]}
                      </div>
                    )}
                    {question.type === 'short-answer' && (
                      <div className="bg-blue-50 p-3 rounded mb-2">
                        <p className="text-sm text-blue-800">
                          <strong>Sample Answer:</strong> {question.correctAnswer}
                        </p>
                      </div>
                    )}
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm text-blue-800">
                        <strong>Explanation:</strong> {question.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Submit Button */}
            {!quizSubmitted && generatedQuiz.questions.length > 0 && (
              <div className="flex flex-col items-center pt-6">
                <button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(userAnswers).length !== generatedQuiz.questions.length}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg font-semibold shadow-lg"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>Submit Quiz</span>
                </button>
                {Object.keys(userAnswers).length !== generatedQuiz.questions.length && (
                  <p className="text-sm text-red-600 mt-3 text-center">
                    ⚠️ Please answer all {generatedQuiz.questions.length} questions before submitting
                    <br />
                    <span className="text-gray-600">({Object.keys(userAnswers).length} of {generatedQuiz.questions.length} answered)</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Quiz Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{generatedQuiz.questions.length}</p>
                <p className="text-sm text-gray-600">Total Questions</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{generatedQuiz.duration}</p>
                <p className="text-sm text-gray-600">Minutes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{generatedQuiz.totalPoints}</p>
                <p className="text-sm text-gray-600">Total Points</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {generatedQuiz.questions.filter(q => q.difficulty === difficulty).length}
                </p>
                <p className="text-sm text-gray-600">{difficulty} Questions</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!generatedQuiz && !isGenerating && (
        <div className="text-center py-12">
          <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Generate Your First Quiz</h4>
          <p className="text-gray-600 mb-4">
            Select a week, configure difficulty and question count, then click "Generate Quiz"
          </p>
        </div>
      )}
    </div>
  );
};

export default QuizGenerator;
