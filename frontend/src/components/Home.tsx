import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Wifi, WifiOff, FolderOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import InputForm from './InputForm';
import Dashboard from './Dashboard';
import SavedPlans from './SavedPlans';
import { TeachingPlan } from '../types';
import { checkApiHealth } from '../utils/api';

function Home() {
  const [teachingPlan, setTeachingPlan] = useState<TeachingPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [activeView, setActiveView] = useState<'create' | 'saved'>('create');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Check API health on component mount
  useEffect(() => {
    const checkHealth = async () => {
      const isHealthy = await checkApiHealth();
      setApiStatus(isHealthy ? 'online' : 'offline');
    };
    
    checkHealth();
  }, []);

  const handlePlanGenerated = (plan: TeachingPlan) => {
    console.log('📚 Teaching plan received in Home:', plan);
    console.log('📊 Plan type:', typeof plan);
    console.log('📋 Plan keys:', Object.keys(plan || {}));
    console.log('📊 Semester plan array:', plan?.semester_plan);
    console.log('📊 Semester plan length:', plan?.semester_plan?.length);
    
    // Validate the plan structure
    if (!plan) {
      console.error('❌ Plan is null or undefined');
      setError('Invalid teaching plan received. Please try again.');
      return;
    }
    
    if (!plan.semester_plan || !Array.isArray(plan.semester_plan)) {
      console.error('❌ semester_plan is missing or not an array:', plan.semester_plan);
      setError('Invalid teaching plan format. Please try again.');
      return;
    }
    
    if (plan.semester_plan.length === 0) {
      console.error('❌ semester_plan is empty');
      setError('Teaching plan has no weeks. Please try again.');
      return;
    }
    
    console.log('✅ Plan validation passed, setting state');
    setTeachingPlan(plan);
    setError(null);
  };

  const handleReset = () => {
    setTeachingPlan(null);
    setError(null);
  };

  const handleRetryConnection = async () => {
    setApiStatus('checking');
    const isHealthy = await checkApiHealth();
    setApiStatus(isHealthy ? 'online' : 'offline');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Tutor</h1>
                <p className="text-sm text-gray-600">Smart Semester Planning</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* User Info - Always show since this is a protected route */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role || 'student'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Logout
                </button>
              </div>
              
              {/* API Status Indicator */}
              <div className="flex items-center space-x-2">
                {apiStatus === 'online' ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : apiStatus === 'offline' ? (
                  <WifiOff 
                    className="h-4 w-4 text-red-500 cursor-pointer" 
                    onClick={handleRetryConnection}
                  />
                ) : (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                )}
                <span className={`text-xs ${
                  apiStatus === 'online' ? 'text-green-600' : 
                  apiStatus === 'offline' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {apiStatus === 'checking' ? 'Checking...' : 
                   apiStatus === 'online' ? 'Connected' : 'Offline'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 text-indigo-600">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-medium">Powered by AI</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md mx-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Generating Your Teaching Plan
                </h3>
                <p className="text-gray-600 mb-4">
                  Our AI is analyzing your syllabus and creating a comprehensive plan...
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>⏱️ This may take 30-60 seconds</p>
                  <p>🤖 Powered by Google Gemini AI</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {!teachingPlan ? (
          <div className="max-w-6xl mx-auto">
            {/* Tab Navigation */}
            <div className="mb-8 flex justify-center space-x-4">
              <button
                onClick={() => setActiveView('create')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeView === 'create'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5" />
                  <span>Create New Plan</span>
                </div>
              </button>
              <button
                onClick={() => setActiveView('saved')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeView === 'saved'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FolderOpen className="h-5 w-5" />
                  <span>Saved Plans</span>
                </div>
              </button>
            </div>

            {activeView === 'create' ? (
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Generate Your Semester Plan
                  </h2>
                  <p className="text-lg text-gray-600">
                    Upload your syllabus and let AI create a comprehensive teaching plan with activities, aids, and assessments.
                  </p>
                </div>
                
                {/* Offline Warning */}
                {apiStatus === 'offline' && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-red-700">
                      <WifiOff className="h-5 w-5" />
                      <span className="font-medium">Backend server is offline</span>
                    </div>
                    <p className="text-red-600 text-sm mt-1">
                      Please make sure the backend server is running on port 3000.
                      <button 
                        onClick={handleRetryConnection}
                    className="ml-2 text-red-700 underline hover:no-underline"
                  >
                    Retry connection
                  </button>
                </p>
              </div>
            )}
            
            <InputForm 
              onPlanGenerated={handlePlanGenerated}
              loading={loading}
              setLoading={setLoading}
              error={error}
              setError={setError}
              disabled={apiStatus === 'offline'}
            />
          </div>
            ) : (
              <SavedPlans onLoadPlan={handlePlanGenerated} />
            )}
          </div>
        ) : (
          <Dashboard 
            teachingPlan={teachingPlan} 
            onReset={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              Built for Hackathon 2025 
            </p>
            <div className="flex justify-center space-x-4 text-sm text-gray-500">
              <span>React + TypeScript</span>
              <span>•</span>
              <span>Google Gemini AI</span>
              <span>•</span>
              <span>Tailwind CSS</span>
              <span>•</span>
              <span>Premium Features FREE</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
