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

    try {
      console.log('Submitting form data:', formData);
      const response = await generateTeachingPlan(formData);
      console.log('Received response:', response);
      onPlanGenerated(response as TeachingPlan);
    } catch (err: any) {
      console.error('Error generating plan:', err);
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
          <input
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({...formData, duration: e.target.value})}
            placeholder="16"
            min="1"
            max="52"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
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
              <span>Generating Plan...</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>Generate Teaching Plan</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default InputForm;