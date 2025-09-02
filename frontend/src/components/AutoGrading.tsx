import React, { useState } from 'react';
import { Zap, FileText, CheckCircle, Clock, Star, Upload } from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  type: 'quiz' | 'essay' | 'coding' | 'project';
  submitted: number;
  graded: number;
  avgScore: number;
}

const AutoGrading: React.FC = () => {
  const [assignments] = useState<Assignment[]>([
    {
      id: '1',
      title: 'Python Basics Quiz',
      type: 'quiz',
      submitted: 28,
      graded: 28,
      avgScore: 85
    },
    {
      id: '2',
      title: 'Algorithm Design Project',
      type: 'project',
      submitted: 25,
      graded: 23,
      avgScore: 78
    },
    {
      id: '3',
      title: 'Database SQL Assignment',
      type: 'coding',
      submitted: 30,
      graded: 25,
      avgScore: 92
    },
    {
      id: '4',
      title: 'Web Development Essay',
      type: 'essay',
      submitted: 27,
      graded: 20,
      avgScore: 81
    }
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz': return '📝';
      case 'essay': return '📄';
      case 'coding': return '💻';
      case 'project': return '🎯';
      default: return '📋';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quiz': return 'bg-blue-100 text-blue-800';
      case 'essay': return 'bg-purple-100 text-purple-800';
      case 'coding': return 'bg-green-100 text-green-800';
      case 'project': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalSubmitted = assignments.reduce((sum, a) => sum + a.submitted, 0);
  const totalGraded = assignments.reduce((sum, a) => sum + a.graded, 0);
  const overallAvg = Math.round(assignments.reduce((sum, a) => sum + a.avgScore, 0) / assignments.length);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Zap className="h-6 w-6 text-yellow-600" />
        <h3 className="text-xl font-bold text-gray-900">Auto-Grading System</h3>
        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          FREE
        </span>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Submitted</p>
              <p className="text-2xl font-bold text-blue-900">{totalSubmitted}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Auto-Graded</p>
              <p className="text-2xl font-bold text-green-900">{totalGraded}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Average Score</p>
              <p className="text-2xl font-bold text-yellow-900">{overallAvg}%</p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Assignment List */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-700">Recent Assignments</h4>
        {assignments.map((assignment) => (
          <div key={assignment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getTypeIcon(assignment.type)}</span>
                <div>
                  <h5 className="font-medium text-gray-900">{assignment.title}</h5>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getTypeColor(assignment.type)}`}>
                      {assignment.type.charAt(0).toUpperCase() + assignment.type.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <p className="text-gray-600">Graded: {assignment.graded}/{assignment.submitted}</p>
                    <p className="font-medium text-gray-900">Avg: {assignment.avgScore}%</p>
                  </div>
                  
                  {assignment.graded < assignment.submitted ? (
                    <div className="h-5 w-5 text-orange-500" title="Grading in progress">
                      <Clock className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="h-5 w-5 text-green-500" title="All graded">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Grading Progress</span>
                <span>{Math.round((assignment.graded / assignment.submitted) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(assignment.graded / assignment.submitted) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex space-x-3">
        <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Upload className="h-4 w-4" />
          <span>Upload New Assignment</span>
        </button>
        <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
          <Zap className="h-4 w-4" />
          <span>Grade All Pending</span>
        </button>
      </div>
    </div>
  );
};

export default AutoGrading;
