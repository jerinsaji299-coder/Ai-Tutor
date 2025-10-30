import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Download, Trash2, Eye } from 'lucide-react';
import axios from 'axios';

interface SavedPlan {
  _id: string;
  subject: string;
  grade: string;
  duration: number;
  teacherName: string;
  createdAt: string;
  semesterPlan: Array<{
    week: number;
    topics: string;
    activities: string;
  }>;
}

interface Props {
  onLoadPlan: (plan: any) => void;
}

const SavedPlans: React.FC<Props> = ({ onLoadPlan }) => {
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedPlans();
  }, []);

  const fetchSavedPlans = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/planning/saved-plans');
      setPlans(response.data.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch saved plans');
    } finally {
      setLoading(false);
    }
  };

  const loadPlan = async (planId: string) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/planning/saved-plans/${planId}`);
      const plan = response.data.data;
      
      // Transform to expected format
      const teachingPlan = {
        semester_plan: plan.semesterPlan,
        lesson_aids: plan.lessonAids,
        assessments: plan.assessments,
        metadata: {
          subject: plan.subject,
          grade: plan.grade,
          duration: plan.duration,
          generated_at: plan.createdAt,
          total_weeks: plan.semesterPlan.length
        }
      };
      
      onLoadPlan(teachingPlan);
    } catch (err) {
      alert('Failed to load plan');
    }
  };

  const deletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    
    try {
      await axios.delete(`http://localhost:3000/api/planning/saved-plans/${planId}`);
      setPlans(plans.filter(p => p._id !== planId));
    } catch (err) {
      alert('Failed to delete plan');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Saved Plans Yet</h3>
        <p className="text-gray-500">Generate your first teaching plan to see it here!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Saved Teaching Plans</h2>
        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
          {plans.length} {plans.length === 1 ? 'Plan' : 'Plans'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan._id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
              <h3 className="text-white font-bold text-lg">{plan.subject}</h3>
              <p className="text-indigo-100 text-sm">Grade {plan.grade}</p>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{plan.duration} weeks</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <BookOpen className="h-4 w-4" />
                <span>{plan.semesterPlan?.length || 0} modules</span>
              </div>

              <div className="text-xs text-gray-500">
                Created: {new Date(plan.createdAt).toLocaleDateString()}
              </div>

              <div className="flex space-x-2 pt-3">
                <button
                  onClick={() => loadPlan(plan._id)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                >
                  <Eye className="h-4 w-4" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => deletePlan(plan._id)}
                  className="flex items-center justify-center bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedPlans;
