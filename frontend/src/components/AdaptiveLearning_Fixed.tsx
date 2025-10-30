import React, { useState } from 'react';
import { 
  Brain, 
  TrendingUp, 
  MessageSquare, 
  Target, 
  CheckCircle, 
  AlertCircle
} from 'lucide-react';

interface AdaptiveLearningProps {
  teachingPlan: any;
}

const AdaptiveLearning: React.FC<AdaptiveLearningProps> = ({ teachingPlan }) => {
  const [activeTab, setActiveTab] = useState('knowledge-test');
  const [knowledgeTest, setKnowledgeTest] = useState<any[]>([]);
  const [studentAnswers, setStudentAnswers] = useState<any>({});
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateKnowledgeTest = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Extract detailed syllabus information
      const extractSyllabusTopics = () => {
        if (!teachingPlan || !teachingPlan.weeks) {
          return ['Sample Topic'];
        }

        // Get all weekly topics with their content
        const weeklyContent = teachingPlan.weeks.map((week: any) => {
          return {
            week: week.week,
            topic: week.topic,
            content: week.content,
            learning_objectives: week.learning_objectives || [],
            activities: week.activities || []
          };
        });

        // Extract topic names and content for question generation
        const topics = weeklyContent.map((week: any) => ({
          title: week.topic,
          description: week.content,
          objectives: week.learning_objectives,
          weekNumber: week.week
        }));

        return topics.slice(0, 6); // Limit to first 6 weeks for focused testing
      };

      const syllabusTopics = extractSyllabusTopics();
      
      const syllabusData = {
        subject: teachingPlan.subject || teachingPlan.title || 'General Studies',
        grade: teachingPlan.grade || '10',
        topics: syllabusTopics,
        duration: teachingPlan.duration || 12,
        difficulty: 'medium',
        focusAreas: syllabusTopics.slice(0, 3) // Focus on first 3 weeks primarily
      };

      console.log('🧠 Generating MCQ knowledge test from syllabus...', syllabusData);

      const response = await fetch('http://localhost:3000/api/adaptive/generate-knowledge-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          syllabusData,
          studentProfile: {
            learningStyle: 'adaptive',
            previousPerformance: 75,
            weeksFocused: syllabusTopics.map((t: any) => t.weekNumber).slice(0, 3)
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Check for specific API rate limiting
        if (response.status === 503 || response.status === 429) {
          throw new Error('🤖 AI services are temporarily busy during peak usage. Please wait 30 seconds and try again.');
        }
        
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ MCQ knowledge test generated:', data);
      
      if (data.success && data.test?.questions) {
        setKnowledgeTest(data.test.questions);
        setError('');
      } else {
        throw new Error('No MCQ questions were generated. Please try again.');
      }
      
    } catch (err) {
      console.error('❌ MCQ knowledge test generation error:', err);
      
      const error = err as Error;
      
      // User-friendly error messages
      if (error.message.includes('AI services are temporarily busy')) {
        setError(error.message);
      } else if (error.message.includes('Failed to fetch')) {
        setError('❌ Cannot connect to the server. Please make sure the backend is running on port 3000.');
      } else {
        setError(`❌ ${error.message}`);
      }
    }
    
    setLoading(false);
  };

  const submitTest = async () => {
    setLoading(true);
    try {
      const testResults = {
        answers: Object.entries(studentAnswers).map(([questionId, answer]) => ({
          questionId,
          answer,
          isCorrect: Math.random() > 0.3 // Mock scoring for demo
        })),
        timeSpent: 10,
        testId: `test_${Date.now()}`
      };

      // Mock performance analysis
      const mockPerformance = {
        score: 75,
        totalQuestions: knowledgeTest.length,
        correctAnswers: Math.floor(knowledgeTest.length * 0.75),
        timeSpent: 10,
        weakAreas: ['Introduction to Programming'],
        strongAreas: ['Loops and Conditionals'],
        recommendations: {
          overall: 'Good performance! Review weak areas to improve.'
        }
      };

      setPerformance(mockPerformance);
      setActiveTab('performance');
    } catch (error) {
      console.error('Error submitting test:', error);
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'knowledge-test', label: 'MCQ Knowledge Test', icon: Brain },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'adaptive-syllabus', label: 'Adaptive Syllabus', icon: Target }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'knowledge-test' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-500" />
                  Adaptive MCQ Knowledge Assessment
                </h3>
                <button
                  onClick={generateKnowledgeTest}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Generating MCQs...' : 'Generate MCQ Test'}
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-red-800 font-medium">Error</p>
                    <p className="text-red-700 mt-1">{error}</p>
                    {error.includes('AI services are temporarily busy') && (
                      <p className="text-red-600 text-sm mt-2">
                        💡 Tip: This usually resolves within 1-2 minutes. The AI models are experiencing high demand.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Syllabus Overview */}
              {teachingPlan && teachingPlan.weeks && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-3">📚 Current Syllabus Content</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {teachingPlan.weeks.slice(0, 6).map((week: any, index: number) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Week {week.week}</span>
                          <span className="text-sm font-medium text-gray-800">{week.topic}</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{week.content?.substring(0, 100)}...</p>
                        {week.learning_objectives && week.learning_objectives.length > 0 && (
                          <div className="text-xs text-gray-500">
                            <strong>Objectives:</strong> {week.learning_objectives.slice(0, 2).join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-blue-700 mt-3">
                    🎯 MCQ test will generate multiple choice questions based on the first 3-6 weeks of syllabus content to assess your understanding of foundational concepts. Each question will have 4 options with one correct answer.
                  </p>
                </div>
              )}

              {knowledgeTest.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-800">Answer the following MCQ questions:</h4>
                  
                  {knowledgeTest.map((question, index) => (
                    <div key={question.id || index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            MCQ {index + 1}
                          </span>
                          {question.week && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              Week {question.week}
                            </span>
                          )}
                          {question.topic && (
                            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                              {question.topic}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {question.difficulty || 'medium'} level
                        </span>
                      </div>
                      
                      <p className="font-medium text-gray-800 mb-4">
                        {question.question}
                      </p>
                      
                      {question.type === 'multiple-choice' && question.options ? (
                        <div className="space-y-3">
                          {question.options.map((option: string, optIndex: number) => {
                            const optionLabel = ['A', 'B', 'C', 'D'][optIndex] || (optIndex + 1).toString();
                            return (
                              <label 
                                key={optIndex} 
                                className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors"
                              >
                                <input
                                  type="radio"
                                  name={`question_${question.id || index}`}
                                  value={option}
                                  checked={studentAnswers[question.id || index] === option}
                                  onChange={(e) => {
                                    setStudentAnswers((prev: any) => ({
                                      ...prev,
                                      [question.id || index]: e.target.value
                                    }));
                                  }}
                                  className="text-blue-500 mt-0.5"
                                />
                                <div className="flex-1">
                                  <span className="font-medium text-blue-600 mr-2">{optionLabel}.</span>
                                  <span className="text-gray-700">{option}</span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-yellow-800 text-sm">
                            This question is not in MCQ format. Please generate a new test for MCQ questions.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={submitTest}
                    disabled={loading || Object.keys(studentAnswers).length === 0}
                    className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                  >
                    <CheckCircle className="h-5 w-5" />
                    {loading ? 'Analyzing Performance...' : `Submit MCQ Test & Analyze Performance (${Object.keys(studentAnswers).length}/${knowledgeTest.length} answered)`}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              {!performance ? (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Complete an MCQ knowledge test to see your performance analysis</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    MCQ Performance Analysis
                  </h3>

                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold">Overall MCQ Score</h4>
                        <p className="text-2xl font-bold">{performance.score}%</p>
                        <p className="text-sm opacity-90">Based on {teachingPlan?.subject || 'course'} syllabus MCQs</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm opacity-90">Time Spent</p>
                        <p className="font-semibold">{performance.timeSpent} min</p>
                        <p className="text-xs opacity-75">Questions: {performance.correctAnswers}/{performance.totalQuestions}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Strong Areas (Syllabus Topics)
                      </h4>
                      <ul className="space-y-2">
                        {performance.strongAreas.map((area: any, index: number) => (
                          <li key={index} className="text-green-700 text-sm">
                            • {area}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Areas for Improvement
                      </h4>
                      <ul className="space-y-2">
                        {performance.weakAreas.map((area: any, index: number) => (
                          <li key={index} className="text-red-700 text-sm">
                            • {area}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-3">📝 MCQ-Based Recommendations</h4>
                    <p className="text-yellow-700 text-sm">
                      <strong>Overall:</strong> {performance.recommendations.overall}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {(activeTab === 'feedback' || activeTab === 'adaptive-syllabus') && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                {activeTab === 'feedback' ? <MessageSquare className="h-12 w-12 mx-auto" /> : <Target className="h-12 w-12 mx-auto" />}
              </div>
              <p className="text-gray-500">
                {activeTab === 'feedback' ? 'MCQ feedback collection' : 'Adaptive syllabus generation'} coming soon...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdaptiveLearning;
