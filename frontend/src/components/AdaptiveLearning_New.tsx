import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Target, BookOpen, AlertCircle, CheckCircle, XCircle, Award, RefreshCw } from 'lucide-react';
import { TeachingPlan } from '../types';
import axios from 'axios';

interface Props {
  teachingPlan: TeachingPlan;
}

interface QuizResult {
  week: number;
  score: number;
  total: number;
  percentage: number;
  correctAnswers: number;
  wrongAnswers: number;
  topics: string;
  date: string;
  questions?: any[];
}

interface WeakArea {
  week: number;
  topic: string;
  score: number;
  needsImprovement: boolean;
}

interface Recommendation {
  week: number;
  topic: string;
  suggestedActivities: string[];
  resources: string[];
  priority: 'high' | 'medium' | 'low';
}

interface RecommendationResponse {
  recommendations: Recommendation[];
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AdaptiveLearning: React.FC<Props> = ({ teachingPlan }) => {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuizResults();
  }, [teachingPlan]);

  const loadQuizResults = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 Loading quiz results from localStorage...');
      
      // Get quiz results from localStorage
      const savedResults = localStorage.getItem('quizResults');
      
      if (savedResults) {
        const results: QuizResult[] = JSON.parse(savedResults);
        console.log(`✅ Loaded ${results.length} quiz results`);
        setQuizResults(results);
        
        // Analyze performance
        if (results.length > 0) {
          await analyzePerformance(results);
        }
      } else {
        console.log('ℹ️ No quiz results found');
        setQuizResults([]);
      }
    } catch (error) {
      console.error('❌ Error loading quiz results:', error);
      setError('Failed to load quiz results');
    } finally {
      setLoading(false);
    }
  };

  const analyzePerformance = async (results: QuizResult[]) => {
    if (results.length === 0) return;
    
    setAnalyzing(true);
    
    try {
      console.log('🔍 Analyzing student performance...');
      
      // Identify weak areas (score < 60%)
      const weak = results
        .filter(r => r.percentage < 60)
        .map(r => ({
          week: r.week,
          topic: r.topics,
          score: r.percentage,
          needsImprovement: true
        }));

      console.log(`📉 Found ${weak.length} weak areas`);
      setWeakAreas(weak);

      // Generate AI recommendations
      if (weak.length > 0) {
        console.log('🤖 Generating AI recommendations for weak areas...');
        const response = await axios.post<RecommendationResponse>(`${API_BASE_URL}/api/adaptive-learning/analyze-performance`, {
          quizResults: results,
          weakAreas: weak,
          teachingPlan: teachingPlan.semester_plan
        });

        setRecommendations(response.data.recommendations || []);
        console.log(`✅ Generated ${response.data.recommendations?.length || 0} recommendations`);
      } else {
        // All quizzes passed! Generate advancement recommendations
        console.log('🎯 Generating advancement recommendations...');
        const response = await axios.post<RecommendationResponse>(`${API_BASE_URL}/api/adaptive-learning/generate-recommendations`, {
          quizResults: results,
          teachingPlan: teachingPlan.semester_plan
        });

        setRecommendations(response.data.recommendations || []);
        console.log(`✅ Generated ${response.data.recommendations?.length || 0} advancement recommendations`);
      }
    } catch (error) {
      console.error('❌ Error analyzing performance:', error);
      setError('Failed to generate recommendations');
    } finally {
      setAnalyzing(false);
    }
  };

  const getOverallPerformance = () => {
    if (quizResults.length === 0) return 0;
    const total = quizResults.reduce((sum, r) => sum + r.percentage, 0);
    return Math.round(total / quizResults.length);
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Adaptive Learning System</h2>
              <p className="text-purple-100 mt-1">
                AI-powered personalized recommendations based on your quiz performance
              </p>
            </div>
          </div>
          <button
            onClick={loadQuizResults}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {quizResults.length === 0 ? (
        /* No Quiz Results Yet */
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            No Quiz Results Yet
          </h3>
          <p className="text-gray-700 mb-4 text-lg">
            Take quizzes in the <strong>"Quiz Generator"</strong> tab to get started!
          </p>
          <div className="bg-white border border-blue-300 rounded-lg p-6 mt-6 max-w-2xl mx-auto">
            <h4 className="font-semibold text-gray-800 mb-3">How It Works:</h4>
            <ol className="text-left space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <span>Go to the <strong>Quiz Generator</strong> tab</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <span>Select a week and generate a quiz</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <span>Complete the quiz and submit your answers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                <span>Return here to see your performance analysis and personalized recommendations</span>
              </li>
            </ol>
          </div>
        </div>
      ) : (
        <>
          {/* Overall Performance Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-600 uppercase">Overall Score</h3>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className={`text-4xl font-bold mb-2 ${getOverallPerformance() >= 80 ? 'text-green-600' : getOverallPerformance() >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {getOverallPerformance()}%
              </div>
              <p className="text-sm text-gray-600">
                Average across {quizResults.length} quiz{quizResults.length !== 1 ? 'zes' : ''}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-600 uppercase">Strong Areas</h3>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-4xl font-bold text-green-600 mb-2">
                {quizResults.filter(r => r.percentage >= 80).length}
              </div>
              <p className="text-sm text-gray-600">
                Topics mastered (≥80%)
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-600">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-600 uppercase">Needs Practice</h3>
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-4xl font-bold text-red-600 mb-2">
                {weakAreas.length}
              </div>
              <p className="text-sm text-gray-600">
                Topics to review (&lt;60%)
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-600">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-600 uppercase">Total Quizzes</h3>
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {quizResults.length}
              </div>
              <p className="text-sm text-gray-600">
                Completed assessments
              </p>
            </div>
          </div>

          {/* Quiz Results Timeline */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-600" />
              Quiz Performance History
            </h3>
            <div className="space-y-3">
              {quizResults.map((result, index) => (
                <div
                  key={index}
                  className={`border-2 rounded-lg p-4 transition-all hover:shadow-md ${getPerformanceColor(result.percentage)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-600 text-white text-sm font-bold px-2 py-1 rounded">
                          Week {result.week}
                        </span>
                        <h4 className="font-semibold text-gray-800">{result.topics}</h4>
                      </div>
                    </div>
                    <div className={`text-3xl font-bold ${result.percentage >= 80 ? 'text-green-600' : result.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {result.percentage}%
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <strong>{result.correctAnswers}</strong> correct
                    </span>
                    <span className="flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <strong>{result.wrongAnswers}</strong> wrong
                    </span>
                    <span className="flex items-center gap-1">
                      <strong>{result.score}/{result.total}</strong> total
                    </span>
                    <span className="ml-auto text-gray-600">{result.date}</span>
                  </div>
                  {result.percentage < 60 && (
                    <div className="mt-2 text-sm text-red-700 font-medium flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Needs improvement - See recommendations below
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Weak Areas */}
          {weakAreas.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-600">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-red-600" />
                Areas Needing Improvement
              </h3>
              <p className="text-gray-600 mb-4">
                These topics scored below 60% and require additional practice:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {weakAreas.map((area, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-gray-800">
                          Week {area.week}
                        </h4>
                        <p className="text-sm text-gray-700 mt-1">{area.topic}</p>
                      </div>
                      <span className="text-2xl font-bold text-red-600">
                        {area.score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Recommendations */}
          {analyzing ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-700 font-medium">🤖 AI is analyzing your performance...</p>
              <p className="text-gray-600 text-sm mt-2">Generating personalized recommendations</p>
            </div>
          ) : recommendations.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-600">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-purple-600" />
                🤖 AI-Powered Personalized Recommendations
              </h3>
              <p className="text-gray-600 mb-6">
                Based on your quiz performance, here are personalized study recommendations:
              </p>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="border-2 border-gray-200 rounded-lg p-5 hover:border-purple-300 transition-all hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-purple-600 text-white text-sm font-bold px-2 py-1 rounded">
                            Week {rec.week}
                          </span>
                          <h4 className="font-bold text-gray-800 text-lg">{rec.topic}</h4>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getPriorityColor(rec.priority)}`}>
                        {rec.priority.toUpperCase()} PRIORITY
                      </span>
                    </div>

                    <div className="mb-4">
                      <h5 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        Suggested Activities:
                      </h5>
                      <ul className="space-y-2">
                        {rec.suggestedActivities.map((activity, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-2 pl-2">
                            <span className="text-purple-600 font-bold">•</span>
                            <span>{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {rec.resources.length > 0 && (
                      <div>
                        <h5 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          Recommended Resources:
                        </h5>
                        <ul className="space-y-1">
                          {rec.resources.map((resource, i) => (
                            <li key={i} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2 pl-2">
                              <span>📚</span>
                              <span>{resource}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {weakAreas.length === 0 && recommendations.length === 0 && !analyzing && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8 text-center">
              <Award className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Excellent Performance! 🎉
              </h3>
              <p className="text-gray-700 mb-4">
                You've scored 60% or higher on all quizzes. Keep up the great work!
              </p>
              <p className="text-sm text-gray-600">
                Continue practicing to maintain your performance and challenge yourself with advanced topics.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdaptiveLearning;
