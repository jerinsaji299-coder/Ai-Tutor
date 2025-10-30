import React, { useState } from 'react';
import { Upload, Send, AlertCircle } from 'lucide-react';
import { FormData, TeachingPlan } from '../types';
import { generateTeachingPlan } from '../utils/api';

interface Props {
  onPlanGenerated: (plan: TeachingPlan) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  disabled?: boolean;
}

const InputForm: React.FC<Props> = ({ 
  onPlanGenerated, 
  loading, 
  setLoading, 
  error, 
  setError 
}) => {
  const [formData, setFormData] = useState<FormData>({
    syllabus: '',
    subject: '',
    grade: '',
    duration: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log('📝 Form submitted with data:', formData);
    console.log('🔢 Duration being sent:', formData.duration, 'Type:', typeof formData.duration);

    try {
      console.log('🚀 Submitting form data to API...');
      const response = await generateTeachingPlan(formData);
      console.log('✅ Received response from API:', response);
      console.log('📊 Response type:', typeof response);
      console.log('📋 Response keys:', Object.keys(response || {}));
      console.log('📚 Response semester_plan:', response?.semester_plan);
      
      if (!response) {
        throw new Error('No response received from API');
      }
      
      if (!response.semester_plan) {
        console.error('❌ Response missing semester_plan:', response);
        throw new Error('Invalid response format from API');
      }
      
      console.log('✅ Passing valid plan to parent component');
      onPlanGenerated(response as TeachingPlan);
    } catch (err: any) {
      console.error('❌ Error generating plan:', err);
      console.error('Error details:', err.response?.data);
      setError(err.message || 'Failed to generate teaching plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSampleLoad = () => {
    setFormData({
      syllabus: `Subject: Computer Science
Grade: 10
Duration: 16 weeks

Topics:
- Week 1–2: Introduction to Algorithms
- Week 3–5: Basics of Python Programming
- Week 6–7: Data Structures (Lists, Stacks, Queues)
- Week 8–9: Object-Oriented Programming
- Week 10–12: Databases and SQL
- Week 13–15: Web Development Basics
- Week 16: Project and Review`,
      subject: 'Computer Science',
      grade: '10',
      duration: '16'
    });
  };

  const handleLoadCompletePlan = () => {
    // Load a pre-generated teaching plan to bypass API
    const completePlan: TeachingPlan = {
      semester_plan: [
        { week: 1, topics: "Introduction to Algorithms", activities: "Discussion on real-life algorithms, pseudocode creation, flowchart exercises" },
        { week: 2, topics: "Algorithm Representation", activities: "Practice writing pseudocode and flowcharts, introduction to algorithm efficiency" },
        { week: 3, topics: "Basics of Python Programming", activities: "Setting up Python environment, writing simple programs, data types practice" },
        { week: 4, topics: "Python Control Structures", activities: "Conditional statements (if, elif, else), loops (for, while), coding challenges" },
        { week: 5, topics: "Python Functions", activities: "Defining and calling functions, passing arguments, creating calculator program" },
        { week: 6, topics: "Data Structures: Lists", activities: "Creating and modifying lists, list operations, implementing algorithms with lists" },
        { week: 7, topics: "Data Structures: Stacks and Queues", activities: "Understanding LIFO and FIFO, implementing stack and queue operations" },
        { week: 8, topics: "Object-Oriented Programming", activities: "Introduction to OOP concepts, defining classes and creating objects" },
        { week: 9, topics: "OOP: Inheritance and Polymorphism", activities: "Creating subclasses, method overriding, encapsulation, class hierarchies" },
        { week: 10, topics: "Databases and SQL", activities: "Introduction to databases, writing basic SQL queries (SELECT, INSERT, UPDATE)" },
        { week: 11, topics: "Advanced SQL Queries", activities: "Using JOINs, WHERE clause, ORDER BY, GROUP BY with aggregate functions" },
        { week: 12, topics: "Python and Databases", activities: "Connecting Python to databases, executing SQL queries from Python" },
        { week: 13, topics: "Web Development: HTML", activities: "Introduction to HTML, creating web pages with basic tags" },
        { week: 14, topics: "Web Development: CSS", activities: "Styling HTML elements with CSS, creating stylesheets" },
        { week: 15, topics: "Web Development: JavaScript", activities: "Adding interactivity to web pages with JavaScript" },
        { week: 16, topics: "Final Project and Review", activities: "Project development, presentations, review of all topics, exam preparation" }
      ],
      lesson_aids: [
        "PPT slides for all topics",
        "Worksheets for practice",
        "Online coding editors (repl.it, CodePen)",
        "Python interpreter (IDLE or VS Code)",
        "Video tutorials",
        "Sample code examples"
      ],
      assessments: [
        "Weekly quizzes",
        "Coding assignments every 2-3 weeks",
        "Midterm exam (Week 8)",
        "Final project (Week 16)",
        "Final exam (Week 16)"
      ],
      metadata: {
        subject: "Computer Science",
        grade: "10",
        duration: 16,
        generated_at: new Date().toISOString(),
        total_weeks: 16
      }
    };
    onPlanGenerated(completePlan);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Syllabus Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Syllabus Content
            </label>
            <button
              type="button"
              onClick={handleSampleLoad}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Load Sample
            </button>
          </div>
          <textarea
            value={formData.syllabus}
            onChange={(e) => setFormData({...formData, syllabus: e.target.value})}
            placeholder="Paste your syllabus content here..."
            className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>

        {/* Subject and Grade Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select Subject</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="English">English</option>
              <option value="History">History</option>
              <option value="Geography">Geography</option>
              <option value="Art">Art</option>
              <option value="Music">Music</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grade Level
            </label>
            <select
              value={formData.grade}
              onChange={(e) => setFormData({...formData, grade: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select Grade</option>
              {Array.from({length: 12}, (_, i) => i + 1).map(grade => (
                <option key={grade} value={grade.toString()}>{grade}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Semester Duration (weeks)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => {
                console.log('Duration input changed to:', e.target.value);
                setFormData({...formData, duration: e.target.value});
              }}
              placeholder="16"
              min="1"
              max="52"
              step="1"
              autoComplete="off"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
            <select
              value={formData.duration}
              onChange={(e) => {
                console.log('Duration dropdown changed to:', e.target.value);
                setFormData({...formData, duration: e.target.value});
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Quick Select</option>
              <option value="8">8 weeks</option>
              <option value="12">12 weeks</option>
              <option value="16">16 weeks</option>
              <option value="20">20 weeks</option>
              <option value="24">24 weeks</option>
              <option value="32">32 weeks</option>
            </select>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Enter a value between 1-52 weeks. Current value: {formData.duration || 'none'}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Generating Plan... (30-60s)</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>Generate Teaching Plan</span>
            </>
          )}
        </button>
        
        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 text-center">
              ⏱️ AI processing can take 30-60 seconds. Please be patient...
            </p>
          </div>
        )}

        {/* Quick Load Button (Bypass API) */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLoadCompletePlan}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 transition-colors"
        >
          <Upload className="h-5 w-5" />
          <span>Load Pre-Generated Plan (Skip API)</span>
        </button>
        <p className="text-xs text-center text-gray-500">
          Use this if the API is temporarily unavailable
        </p>
      </form>
    </div>
  );
};

export default InputForm;