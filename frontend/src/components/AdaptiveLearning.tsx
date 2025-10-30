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
  const [selectedWeek, setSelectedWeek] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('medium');
  const [feedback, setFeedback] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const generateKnowledgeTest = async () => {
    setLoading(true);
    setError('');
    setFeedback(null);
    setShowFeedback(false);
    
    try {
      // Extract detailed syllabus information
      const extractSyllabusTopics = () => {
        if (!teachingPlan || !teachingPlan.weeks) {
          // Create sample MCQ-friendly topics when no teaching plan is available
          return [
            {
              title: "Introduction to Programming",
              description: "Basic programming concepts, variables, data types, and control structures",
              objectives: ["Understand programming fundamentals", "Use variables and data types", "Apply control structures"],
              weekNumber: 1
            },
            {
              title: "Object-Oriented Programming", 
              description: "Classes, objects, inheritance, and polymorphism in programming",
              objectives: ["Create classes and objects", "Implement inheritance", "Use polymorphism"],
              weekNumber: 2
            },
            {
              title: "Data Structures and Algorithms",
              description: "Arrays, lists, sorting algorithms, and search techniques",
              objectives: ["Implement data structures", "Apply sorting algorithms", "Use search techniques"],
              weekNumber: 3
            },
            {
              title: "Database Management",
              description: "SQL, database design, normalization, and data modeling",
              objectives: ["Design databases", "Write SQL queries", "Understand normalization"],
              weekNumber: 4
            },
            {
              title: "Web Development",
              description: "HTML, CSS, JavaScript, and modern web frameworks",
              objectives: ["Create web pages", "Style with CSS", "Add JavaScript interactivity"],
              weekNumber: 5
            },
            {
              title: "Software Engineering",
              description: "Software lifecycle, testing, version control, and project management",
              objectives: ["Understand SDLC", "Implement testing", "Use version control"],
              weekNumber: 6
            }
          ];
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

        return topics;
      };

      let syllabusTopics = extractSyllabusTopics();

      // Filter topics based on selected week
      if (selectedWeek !== 'all') {
        const weekNum = parseInt(selectedWeek);
        syllabusTopics = syllabusTopics.filter((topic: any) => topic.weekNumber === weekNum);
        if (syllabusTopics.length === 0) {
          // Fallback if no topics found for selected week
          syllabusTopics = [
            {
              title: `Week ${weekNum} Topic`,
              description: `Content for week ${weekNum}`,
              objectives: [`Learn week ${weekNum} concepts`],
              weekNumber: weekNum
            }
          ];
        }
      } else {
        // For 'all', focus on first 6 weeks
        syllabusTopics = syllabusTopics.slice(0, 6);
      }
      
      const syllabusData = {
        subject: teachingPlan.subject || teachingPlan.title || 'General Studies',
        grade: teachingPlan.grade || '10',
        topics: syllabusTopics,
        duration: teachingPlan.duration || 12,
        difficulty: selectedDifficulty,
        focusAreas: syllabusTopics.slice(0, selectedWeek === 'all' ? 3 : syllabusTopics.length),
        selectedWeek: selectedWeek === 'all' ? null : parseInt(selectedWeek)
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
      // Calculate actual performance based on answers
      const results = knowledgeTest.map(question => {
        const studentAnswer = studentAnswers[question.id];
        const isCorrect = studentAnswer === question.correctAnswer;
        return {
          questionId: question.id,
          question: question.question,
          studentAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect,
          topic: question.topic,
          week: question.week,
          explanation: question.explanation,
          difficulty: question.difficulty
        };
      });

      const correctAnswers = results.filter(r => r.isCorrect).length;
      const totalQuestions = knowledgeTest.length;
      const score = Math.round((correctAnswers / totalQuestions) * 100);

      // Analyze weak and strong areas
      const topicPerformance: {[key: string]: {correct: number, total: number}} = {};
      const weekPerformance: {[key: string]: {correct: number, total: number}} = {};
      
      results.forEach(result => {
        const topic = result.topic || 'General';
        const week = result.week || 'N/A';
        
        if (!topicPerformance[topic]) topicPerformance[topic] = { correct: 0, total: 0 };
        if (!weekPerformance[week]) weekPerformance[week] = { correct: 0, total: 0 };
        
        topicPerformance[topic].total++;
        weekPerformance[week].total++;
        
        if (result.isCorrect) {
          topicPerformance[topic].correct++;
          weekPerformance[week].correct++;
        }
      });

      // Identify weak and strong areas
      const weakAreas = Object.entries(topicPerformance)
        .filter(([_, perf]: [string, any]) => (perf.correct / perf.total) < 0.6)
        .map(([topic, _]) => topic);
      
      const strongAreas = Object.entries(topicPerformance)
        .filter(([_, perf]: [string, any]) => (perf.correct / perf.total) >= 0.8)
        .map(([topic, _]) => topic);

      // Generate detailed feedback
      const detailedFeedback = {
        results,
        topicBreakdown: Object.entries(topicPerformance).map(([topic, perf]: [string, any]) => ({
          topic,
          score: Math.round((perf.correct / perf.total) * 100),
          correct: perf.correct,
          total: perf.total
        })),
        weekBreakdown: Object.entries(weekPerformance).map(([week, perf]: [string, any]) => ({
          week,
          score: Math.round((perf.correct / perf.total) * 100),
          correct: perf.correct,
          total: perf.total
        })),
        recommendations: generateRecommendations(score, weakAreas, strongAreas),
        areasOfImprovement: generateImprovementAreas(results)
      };

      setFeedback(detailedFeedback);

      const performanceData = {
        score,
        totalQuestions,
        correctAnswers,
        timeSpent: 10, // This could be tracked with a timer
        weakAreas,
        strongAreas,
        recommendations: detailedFeedback.recommendations
      };

      setPerformance(performanceData);
      setShowFeedback(true);
      setActiveTab('performance');
    } catch (error) {
      console.error('Error submitting test:', error);
      setError('Failed to process test results. Please try again.');
    }
    setLoading(false);
  };

  const generateRecommendations = (score: number, weakAreas: string[], strongAreas: string[]) => {
    let overall = '';
    let specific = [];

    if (score >= 90) {
      overall = 'Excellent performance! You have mastered most concepts.';
    } else if (score >= 80) {
      overall = 'Very good performance! Minor improvements needed in some areas.';
    } else if (score >= 70) {
      overall = 'Good performance overall. Focus on strengthening weak areas.';
    } else if (score >= 60) {
      overall = 'Fair performance. Significant review needed in multiple areas.';
    } else {
      overall = 'Needs improvement. Comprehensive review of concepts recommended.';
    }

    if (weakAreas.length > 0) {
      specific.push(`Focus extra attention on: ${weakAreas.join(', ')}`);
      specific.push('Consider reviewing lecture materials and practice exercises for these topics');
    }

    if (strongAreas.length > 0) {
      specific.push(`Strong performance in: ${strongAreas.join(', ')}`);
    }

    return { overall, specific };
  };

  const generateImprovementAreas = (results: any[]) => {
    const incorrectResults = results.filter(r => !r.isCorrect);
    const improvementSuggestions: any[] = [];

    if (incorrectResults.length > 0) {
      const commonMistakes: {[key: string]: any[]} = {};
      incorrectResults.forEach(result => {
        const topic = result.topic || 'General';
        if (!commonMistakes[topic]) commonMistakes[topic] = [];
        
        // Extract actual study topics from the question
        const studyTopics = result.studyTopics || result.learningObjectives || [];
        const relatedConcepts = result.relatedConcepts || [];
        const contentReference = result.contentReference || '';
        
        commonMistakes[topic].push({
          question: result.question,
          yourAnswer: result.studentAnswer,
          correctAnswer: result.correctAnswer,
          explanation: result.explanation,
          studyTopics: studyTopics,
          relatedConcepts: relatedConcepts,
          contentReference: contentReference,
          week: result.week
        });
      });

      Object.entries(commonMistakes).forEach(([topic, mistakes]: [string, any]) => {
        // Collect all unique study topics from incorrect answers
        const allStudyTopics = new Set<string>();
        const allConcepts = new Set<string>();
        
        mistakes.forEach((mistake: any) => {
          mistake.studyTopics?.forEach((t: string) => allStudyTopics.add(t));
          mistake.relatedConcepts?.forEach((c: string) => allConcepts.add(c));
        });
        
        improvementSuggestions.push({
          area: topic,
          week: mistakes[0].week,
          mistakes: mistakes.slice(0, 3), // Show top 3 mistakes per topic
          studyTopics: Array.from(allStudyTopics).filter(t => t && t.length > 0),
          relatedConcepts: Array.from(allConcepts).filter(c => c && c.length > 0),
          suggestion: `Focus on Week ${mistakes[0].week} content. Study the following specific topics: ${Array.from(allStudyTopics).slice(0, 3).join(', ') || topic}`
        });
      });
    }

    return improvementSuggestions;
  };

  const downloadSyllabus = (format: string) => {
    if (!teachingPlan) {
      alert('No syllabus content available to download');
      return;
    }

    const syllabusData = {
      courseInfo: {
        subject: teachingPlan.subject || 'General Studies',
        grade: teachingPlan.grade || 'N/A',
        duration: teachingPlan.duration || 12,
        generatedDate: new Date().toLocaleDateString()
      },
      performance: performance ? {
        lastScore: performance.score,
        strongAreas: performance.strongAreas,
        weakAreas: performance.weakAreas,
        totalQuestionsAnswered: performance.totalQuestions,
        correctAnswers: performance.correctAnswers
      } : null,
      weeklyContent: teachingPlan.weeks || [],
      recommendations: performance?.recommendations || null
    };

    if (format === 'json') {
      const dataStr = JSON.stringify(syllabusData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `adaptive-syllabus-${teachingPlan.subject || 'course'}-${new Date().getTime()}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } 
    else if (format === 'txt') {
      let textContent = `ADAPTIVE SYLLABUS\n`;
      textContent += `===============\n\n`;
      textContent += `Course: ${syllabusData.courseInfo.subject}\n`;
      textContent += `Grade: ${syllabusData.courseInfo.grade}\n`;
      textContent += `Duration: ${syllabusData.courseInfo.duration} weeks\n`;
      textContent += `Generated: ${syllabusData.courseInfo.generatedDate}\n\n`;
      
      if (syllabusData.performance) {
        textContent += `PERFORMANCE SUMMARY\n`;
        textContent += `==================\n`;
        textContent += `Latest Score: ${syllabusData.performance.lastScore}%\n`;
        textContent += `Questions Answered: ${syllabusData.performance.correctAnswers}/${syllabusData.performance.totalQuestionsAnswered}\n`;
        textContent += `Strong Areas: ${syllabusData.performance.strongAreas.join(', ')}\n`;
        textContent += `Areas for Improvement: ${syllabusData.performance.weakAreas.join(', ')}\n\n`;
      }

      textContent += `WEEKLY CONTENT\n`;
      textContent += `=============\n\n`;
      
      syllabusData.weeklyContent.forEach((week: any) => {
        textContent += `Week ${week.week}: ${week.topic}\n`;
        textContent += `-`.repeat(40) + `\n`;
        textContent += `${week.content}\n\n`;
        if (week.learning_objectives) {
          textContent += `Learning Objectives:\n`;
          week.learning_objectives.forEach((obj: string) => {
            textContent += `• ${obj}\n`;
          });
          textContent += `\n`;
        }
        if (week.activities) {
          textContent += `Activities:\n`;
          week.activities.forEach((activity: string) => {
            textContent += `• ${activity}\n`;
          });
          textContent += `\n`;
        }
        textContent += `\n`;
      });

      const dataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(textContent);
      const exportFileDefaultName = `adaptive-syllabus-${teachingPlan.subject || 'course'}-${new Date().getTime()}.txt`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
    else if (format === 'pdf') {
      // For PDF, we'll create a simple HTML content and open it in a new window for printing
      let htmlContent = `
        <html>
        <head>
          <title>Adaptive Syllabus - ${syllabusData.courseInfo.subject}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            h1, h2 { color: #333; }
            .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .performance { background-color: #f0f8ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .week { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .week-title { font-weight: bold; color: #2563eb; margin-bottom: 10px; }
            .objectives, .activities { margin-top: 10px; }
            ul { margin: 5px 0; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Adaptive Syllabus</h1>
            <p><strong>Course:</strong> ${syllabusData.courseInfo.subject}</p>
            <p><strong>Grade:</strong> ${syllabusData.courseInfo.grade}</p>
            <p><strong>Duration:</strong> ${syllabusData.courseInfo.duration} weeks</p>
            <p><strong>Generated:</strong> ${syllabusData.courseInfo.generatedDate}</p>
          </div>
      `;

      if (syllabusData.performance) {
        htmlContent += `
          <div class="performance">
            <h2>Performance Summary</h2>
            <p><strong>Latest Score:</strong> ${syllabusData.performance.lastScore}%</p>
            <p><strong>Questions Answered:</strong> ${syllabusData.performance.correctAnswers}/${syllabusData.performance.totalQuestionsAnswered}</p>
            <p><strong>Strong Areas:</strong> ${syllabusData.performance.strongAreas.join(', ')}</p>
            <p><strong>Areas for Improvement:</strong> ${syllabusData.performance.weakAreas.join(', ')}</p>
          </div>
        `;
      }

      htmlContent += `<h2>Weekly Content</h2>`;
      
      syllabusData.weeklyContent.forEach((week: any) => {
        htmlContent += `
          <div class="week">
            <div class="week-title">Week ${week.week}: ${week.topic}</div>
            <p>${week.content}</p>
        `;
        if (week.learning_objectives) {
          htmlContent += `
            <div class="objectives">
              <strong>Learning Objectives:</strong>
              <ul>
                ${week.learning_objectives.map((obj: string) => `<li>${obj}</li>`).join('')}
              </ul>
            </div>
          `;
        }
        if (week.activities) {
          htmlContent += `
            <div class="activities">
              <strong>Activities:</strong>
              <ul>
                ${week.activities.map((activity: string) => `<li>${activity}</li>`).join('')}
              </ul>
            </div>
          `;
        }
        htmlContent += `</div>`;
      });

      htmlContent += `
        </body>
        </html>
      `;

      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        newWindow.focus();
        setTimeout(() => {
          newWindow.print();
        }, 500);
      }
    }
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
              </div>

              {/* Test Configuration */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">🎯 Test Configuration</h4>
                
                {/* Question Count Info Banner */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <Brain className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-2">📊 Question Count by Difficulty Level:</p>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className={`p-2 rounded ${selectedDifficulty === 'easy' ? 'bg-blue-100 border border-blue-300' : 'bg-white'}`}>
                          <div className="font-bold text-green-700">✓ Easy</div>
                          <div className="text-gray-700">5 Questions</div>
                        </div>
                        <div className={`p-2 rounded ${selectedDifficulty === 'medium' ? 'bg-blue-100 border border-blue-300' : 'bg-white'}`}>
                          <div className="font-bold text-yellow-700">✓ Medium</div>
                          <div className="text-gray-700">7 Questions</div>
                        </div>
                        <div className={`p-2 rounded ${selectedDifficulty === 'hard' ? 'bg-blue-100 border border-blue-300' : 'bg-white'}`}>
                          <div className="font-bold text-red-700">✓ Hard</div>
                          <div className="text-gray-700">10 Questions</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Week</label>
                    <select
                      value={selectedWeek}
                      onChange={(e) => setSelectedWeek(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Weeks (Mixed Test)</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(week => (
                        <option key={week} value={week.toString()}>Week {week}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={generateKnowledgeTest}
                      disabled={loading}
                      className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium transition-all"
                    >
                      {loading ? (
                        <>
                          <span className="inline-block animate-spin mr-2">⚙️</span>
                          Generating {selectedDifficulty === 'easy' ? '5' : selectedDifficulty === 'medium' ? '7' : '10'} MCQs...
                        </>
                      ) : (
                        <>Generate {selectedDifficulty === 'easy' ? '5' : selectedDifficulty === 'medium' ? '7' : '10'} MCQ Questions</>
                      )}
                    </button>
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  {selectedWeek === 'all' 
                    ? `📚 Questions will be generated from multiple weeks (${selectedDifficulty === 'easy' ? '5' : selectedDifficulty === 'medium' ? '7' : '10'} total) for comprehensive assessment.`
                    : `📖 Questions will focus specifically on Week ${selectedWeek} content (${selectedDifficulty === 'easy' ? '5' : selectedDifficulty === 'medium' ? '7' : '10'} questions).`
                  }
                </div>
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

          {activeTab === 'feedback' && (
            <div className="space-y-6">
              {!feedback ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Complete an MCQ test to see detailed feedback and improvement suggestions</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    Detailed MCQ Feedback & Analysis
                  </h3>

                  {/* Topic-wise Performance Breakdown */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold mb-4 text-gray-800">📊 Topic-wise Performance Breakdown</h4>
                    <div className="grid gap-4">
                      {feedback.topicBreakdown.map((topic: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium text-gray-800">{topic.topic}</span>
                            <span className="text-sm text-gray-600 ml-2">({topic.correct}/{topic.total} correct)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${topic.score >= 80 ? 'bg-green-500' : topic.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${topic.score}%` }}
                              ></div>
                            </div>
                            <span className={`font-semibold text-sm ${topic.score >= 80 ? 'text-green-600' : topic.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {topic.score}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Week-wise Performance */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold mb-4 text-gray-800">📅 Week-wise Performance</h4>
                    <div className="grid gap-3">
                      {feedback.weekBreakdown.map((week: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <span className="font-medium text-gray-800">Week {week.week}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">({week.correct}/{week.total})</span>
                            <span className={`font-semibold ${week.score >= 80 ? 'text-green-600' : week.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {week.score}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Areas of Improvement with ACTUAL STUDY TOPICS */}
                  {feedback.areasOfImprovement.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                      <h4 className="font-semibold mb-4 text-orange-800">🎯 Specific Areas for Improvement & Study Topics</h4>
                      {feedback.areasOfImprovement.map((area: any, index: number) => (
                        <div key={index} className="mb-6 last:mb-0 bg-white rounded-lg p-4 border-2 border-orange-200">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h5 className="font-semibold text-orange-900 text-lg">{area.area}</h5>
                              <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">Week {area.week}</span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-orange-700 mb-4 font-medium bg-orange-100 p-3 rounded">
                            📚 {area.suggestion}
                          </p>
                          
                          {/* ACTUAL STUDY TOPICS from syllabus */}
                          {area.studyTopics && area.studyTopics.length > 0 && (
                            <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                              <h6 className="text-xs font-bold text-blue-900 mb-2 uppercase">📖 Specific Topics to Study:</h6>
                              <ul className="list-disc list-inside space-y-1">
                                {area.studyTopics.map((topic: string, tIndex: number) => (
                                  <li key={tIndex} className="text-sm text-blue-800 font-medium">
                                    {topic}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {/* Related Concepts */}
                          {area.relatedConcepts && area.relatedConcepts.length > 0 && (
                            <div className="mb-4 p-3 bg-purple-50 rounded border border-purple-200">
                              <h6 className="text-xs font-bold text-purple-900 mb-2 uppercase">🔗 Related Concepts:</h6>
                              <div className="flex flex-wrap gap-2">
                                {area.relatedConcepts.map((concept: string, cIndex: number) => (
                                  <span key={cIndex} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                                    {concept}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Your Mistakes */}
                          <div className="space-y-2">
                            <h6 className="text-xs font-bold text-gray-700 mb-2 uppercase">❌ Your Mistakes:</h6>
                            {area.mistakes.map((mistake: any, mIndex: number) => (
                              <div key={mIndex} className="bg-gray-50 p-3 rounded border-l-4 border-red-400">
                                <p className="text-sm font-medium text-gray-800 mb-2">Q: {mistake.question}</p>
                                <div className="text-xs space-y-1">
                                  <div className="flex items-start gap-2">
                                    <span className="text-red-600 font-semibold">Your answer:</span>
                                    <span className="text-red-700">{mistake.yourAnswer || 'Not answered'}</span>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <span className="text-green-600 font-semibold">Correct answer:</span>
                                    <span className="text-green-700">{mistake.correctAnswer}</span>
                                  </div>
                                </div>
                                {mistake.explanation && (
                                  <p className="text-xs text-blue-700 mt-2 bg-blue-50 p-2 rounded">
                                    💡 <strong>Explanation:</strong> {mistake.explanation}
                                  </p>
                                )}
                                {mistake.contentReference && (
                                  <p className="text-xs text-gray-600 mt-2 italic">
                                    📝 <strong>Reference:</strong> {mistake.contentReference.substring(0, 150)}...
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recommendations */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-semibold mb-4 text-blue-800">💡 Personalized Recommendations</h4>
                    <div className="space-y-3">
                      <p className="text-blue-900 font-medium">{feedback.recommendations.overall}</p>
                      {feedback.recommendations.specific.map((rec: string, index: number) => (
                        <p key={index} className="text-blue-800 text-sm">• {rec}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'adaptive-syllabus' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                Adaptive Syllabus Content
              </h3>

              {!teachingPlan ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No teaching plan available for adaptive syllabus generation</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Download Options */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h4 className="font-semibold mb-4 text-purple-800">📥 Download Adaptive Syllabus</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        onClick={() => downloadSyllabus('json')}
                        className="flex items-center justify-center gap-2 p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        📄 Download as JSON
                      </button>
                      <button
                        onClick={() => downloadSyllabus('pdf')}
                        className="flex items-center justify-center gap-2 p-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        📋 Download as PDF
                      </button>
                      <button
                        onClick={() => downloadSyllabus('txt')}
                        className="flex items-center justify-center gap-2 p-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        📝 Download as TXT
                      </button>
                    </div>
                  </div>

                  {/* Syllabus Content Preview */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold mb-4 text-gray-800">📚 Syllabus Content Preview</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h5 className="font-medium text-blue-900">Course Information</h5>
                          <p className="text-sm text-blue-800">Subject: {teachingPlan.subject || 'General Studies'}</p>
                          <p className="text-sm text-blue-800">Grade: {teachingPlan.grade || 'N/A'}</p>
                          <p className="text-sm text-blue-800">Duration: {teachingPlan.duration || 12} weeks</p>
                        </div>
                        {performance && (
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h5 className="font-medium text-green-900">Your Performance</h5>
                            <p className="text-sm text-green-800">Latest Score: {performance.score}%</p>
                            <p className="text-sm text-green-800">Strong Areas: {performance.strongAreas.length}</p>
                            <p className="text-sm text-green-800">Areas to Improve: {performance.weakAreas.length}</p>
                          </div>
                        )}
                      </div>

                      {/* Weekly Content */}
                      <div className="space-y-4">
                        {teachingPlan.weeks && teachingPlan.weeks.map((week: any, index: number) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h5 className="font-medium text-gray-900">Week {week.week}: {week.topic}</h5>
                                {performance && feedback && (
                                  <div className="mt-1">
                                    {feedback.weekBreakdown.find((w: any) => w.week === week.week.toString()) && (
                                      <span className={`text-xs px-2 py-1 rounded ${
                                        feedback.weekBreakdown.find((w: any) => w.week === week.week.toString())?.score >= 80 
                                          ? 'bg-green-100 text-green-800' 
                                          : feedback.weekBreakdown.find((w: any) => w.week === week.week.toString())?.score >= 60
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        Your Performance: {feedback.weekBreakdown.find((w: any) => w.week === week.week.toString())?.score}%
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 mb-3">{week.content}</p>
                            {week.learning_objectives && week.learning_objectives.length > 0 && (
                              <div className="mb-3">
                                <h6 className="text-xs font-medium text-gray-600 mb-1">Learning Objectives:</h6>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  {week.learning_objectives.map((obj: string, objIndex: number) => (
                                    <li key={objIndex}>• {obj}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {week.activities && week.activities.length > 0 && (
                              <div>
                                <h6 className="text-xs font-medium text-gray-600 mb-1">Activities:</h6>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  {week.activities.map((activity: string, actIndex: number) => (
                                    <li key={actIndex}>• {activity}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdaptiveLearning;
