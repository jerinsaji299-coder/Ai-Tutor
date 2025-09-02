import React, { useState } from 'react';
import { Target, User, TrendingUp, Brain, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { TeachingPlan } from '../types';

interface Student {
  id: string;
  name: string;
  avatar: string;
  progress: number;
  strengths: string[];
  weaknesses: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic';
  currentWeek: number;
  completedActivities: number;
  totalActivities: number;
}

interface Props {
  teachingPlan: TeachingPlan;
}

const PersonalizedLearning: React.FC<Props> = ({ teachingPlan }) => {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const students: Student[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      avatar: '👩‍🎓',
      progress: 85,
      strengths: ['Problem Solving', 'Logical Thinking'],
      weaknesses: ['Documentation', 'Team Communication'],
      learningStyle: 'visual',
      currentWeek: 8,
      completedActivities: 15,
      totalActivities: 18
    },
    {
      id: '2',
      name: 'Bob Smith',
      avatar: '👨‍🎓',
      progress: 72,
      strengths: ['Creative Thinking', 'Web Design'],
      weaknesses: ['Algorithm Analysis', 'Math Concepts'],
      learningStyle: 'kinesthetic',
      currentWeek: 7,
      completedActivities: 12,
      totalActivities: 16
    },
    {
      id: '3',
      name: 'Carol Davis',
      avatar: '👩‍💻',
      progress: 91,
      strengths: ['Database Design', 'SQL Queries'],
      weaknesses: ['Object-Oriented Programming'],
      learningStyle: 'auditory',
      currentWeek: 9,
      completedActivities: 18,
      totalActivities: 20
    },
    {
      id: '4',
      name: 'David Wilson',
      avatar: '👨‍💻',
      progress: 68,
      strengths: ['HTML/CSS', 'User Interface'],
      weaknesses: ['Programming Logic', 'Debugging'],
      learningStyle: 'visual',
      currentWeek: 6,
      completedActivities: 10,
      totalActivities: 14
    }
  ];

  const getLearningStyleColor = (style: string) => {
    switch (style) {
      case 'visual': return 'bg-blue-100 text-blue-800';
      case 'auditory': return 'bg-green-100 text-green-800';
      case 'kinesthetic': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const generatePersonalizedRecommendations = (student: Student) => {
    const recommendations = [];
    const currentWeek = teachingPlan.semester_plan.find(w => w.week === student.currentWeek);
    
    if (student.progress < 75) {
      recommendations.push({
        type: 'warning',
        message: 'Consider additional practice sessions for core concepts',
        icon: AlertCircle
      });
    }

    if (student.learningStyle === 'visual' && currentWeek) {
      recommendations.push({
        type: 'info',
        message: 'Add visual diagrams and flowcharts for this week\'s topics',
        icon: Target
      });
    }

    if (student.weaknesses.includes('Programming Logic')) {
      recommendations.push({
        type: 'suggestion',
        message: 'Recommend additional coding exercises and debugging practice',
        icon: Brain
      });
    }

    return recommendations;
  };

  const classAverage = Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Target className="h-6 w-6 text-indigo-600" />
        <h3 className="text-xl font-bold text-gray-900">Personalized Learning</h3>
        <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          AI-POWERED
        </span>
      </div>

      {/* Class Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Class Average</p>
              <p className="text-2xl font-bold text-blue-900">{classAverage}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Active Students</p>
              <p className="text-2xl font-bold text-green-900">{students.length}</p>
            </div>
            <User className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Current Week</p>
              <p className="text-2xl font-bold text-purple-900">{Math.max(...students.map(s => s.currentWeek))}</p>
            </div>
            <Clock className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-700">Individual Student Progress</h4>
        {students.map((student) => (
          <div key={student.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{student.avatar}</span>
                <div>
                  <h5 className="font-medium text-gray-900">{student.name}</h5>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getLearningStyleColor(student.learningStyle)}`}>
                      {student.learningStyle} learner
                    </span>
                    <span className="text-xs text-gray-500">Week {student.currentWeek}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{student.progress}%</span>
                  {student.progress >= 80 ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : student.progress >= 70 ? (
                    <Clock className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Overall Progress</span>
                <span>{student.completedActivities}/{student.totalActivities} activities</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    student.progress >= 80 ? 'bg-green-500' :
                    student.progress >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${student.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Expandable Details */}
            {selectedStudent === student.id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h6 className="font-medium text-green-700 mb-2">Strengths</h6>
                    <ul className="space-y-1">
                      {student.strengths.map((strength, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h6 className="font-medium text-orange-700 mb-2">Areas for Improvement</h6>
                    <ul className="space-y-1">
                      {student.weaknesses.map((weakness, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center space-x-1">
                          <Target className="h-3 w-3 text-orange-500" />
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* AI Recommendations */}
                <div className="mt-4">
                  <h6 className="font-medium text-indigo-700 mb-2">AI Recommendations</h6>
                  <div className="space-y-2">
                    {generatePersonalizedRecommendations(student).map((rec, index) => {
                      const IconComponent = rec.icon;
                      return (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <IconComponent className="h-4 w-4 text-indigo-500" />
                          <span className="text-gray-700">{rec.message}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedStudent(selectedStudent === student.id ? null : student.id)}
              className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {selectedStudent === student.id ? 'Hide Details' : 'View Details'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonalizedLearning;
