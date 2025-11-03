import React from 'react';
import { BarChart3, TrendingUp, Users, Clock, Target, Award } from 'lucide-react';
import { TeachingPlan } from '../types';

interface Props {
  teachingPlan: TeachingPlan;
}

const Analytics: React.FC<Props> = ({ teachingPlan }) => {
  // Calculate analytics from the teaching plan
  const totalWeeks = teachingPlan.semester_plan.length;
  const totalActivities = teachingPlan.semester_plan.reduce((sum, week) => {
    const activities = typeof week.activities === 'string' 
      ? week.activities.split('.').length - 1 
      : Array.isArray(week.activities) 
        ? (week.activities as any[]).length 
        : 0;
    return sum + activities;
  }, 0);
  const avgActivitiesPerWeek = Math.round(totalActivities / totalWeeks);
  const totalAssessments = teachingPlan.assessments.length;

  const analyticsData = [
    {
      icon: Clock,
      label: 'Total Duration',
      value: `${totalWeeks} weeks`,
      color: 'bg-blue-500',
      description: 'Complete semester duration'
    },
    {
      icon: Target,
      label: 'Learning Activities',
      value: totalActivities.toString(),
      color: 'bg-green-500',
      description: 'Hands-on learning experiences'
    },
    {
      icon: Award,
      label: 'Assessments',
      value: totalAssessments.toString(),
      color: 'bg-purple-500',
      description: 'Evaluation methods'
    },
    {
      icon: TrendingUp,
      label: 'Avg Activities/Week',
      value: avgActivitiesPerWeek.toString(),
      color: 'bg-orange-500',
      description: 'Weekly activity density'
    },
    {
      icon: Users,
      label: 'Learning Aids',
      value: teachingPlan.lesson_aids.length.toString(),
      color: 'bg-indigo-500',
      description: 'Support resources'
    },
    {
      icon: BarChart3,
      label: 'Engagement Score',
      value: `${Math.min(95, Math.round((totalActivities + totalAssessments) * 2.5))}%`,
      color: 'bg-red-500',
      description: 'Predicted student engagement'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <BarChart3 className="h-6 w-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">Advanced Analytics</h3>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          FREE
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analyticsData.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div key={index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${item.color}`}>
                  <IconComponent className="h-4 w-4 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{item.value}</span>
              </div>
              <h4 className="font-semibold text-gray-700 text-sm">{item.label}</h4>
              <p className="text-gray-500 text-xs mt-1">{item.description}</p>
            </div>
          );
        })}
      </div>

      {/* Progress Visualization */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-700 mb-3">Weekly Progress Timeline</h4>
        <div className="flex items-center space-x-1 overflow-x-auto">
          {teachingPlan.semester_plan.map((week) => (
            <div
              key={week.week}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium"
              title={`Week ${week.week}: ${week.topics}`}
            >
              {week.week}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
