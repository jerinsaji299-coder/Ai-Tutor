import React, { useState } from 'react';
import { BarChart3, Target, Users, Zap, Star, Brain } from 'lucide-react';
import Analytics from './Analytics';
import PersonalizedLearning from './PersonalizedLearning';
import CollaborationTools from './CollaborationTools';
import AutoGrading from './AutoGrading';
import PremiumTemplates from './PremiumTemplates';
import QuizGenerator from './QuizGenerator';
import { TeachingPlan } from '../types';

interface Props {
  teachingPlan: TeachingPlan;
}

type TabType = 'analytics' | 'personalized' | 'collaboration' | 'grading' | 'templates' | 'quiz';

const FeatureTabs: React.FC<Props> = ({ teachingPlan }) => {
  const [activeTab, setActiveTab] = useState<TabType>('analytics');

  const tabs = [
    {
      id: 'analytics' as TabType,
      label: 'Analytics',
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500'
    },
    {
      id: 'quiz' as TabType,
      label: 'Quiz Generator',
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-500'
    },
    {
      id: 'personalized' as TabType,
      label: 'Personalized Learning',
      icon: Target,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-500'
    },
    {
      id: 'collaboration' as TabType,
      label: 'Collaboration',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500'
    },
    {
      id: 'grading' as TabType,
      label: 'Auto-Grading',
      icon: Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-500'
    },
    {
      id: 'templates' as TabType,
      label: 'Templates',
      icon: Star,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-500'
    }
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'analytics':
        return <Analytics teachingPlan={teachingPlan} />;
      case 'quiz':
        return <QuizGenerator teachingPlan={teachingPlan} />;
      case 'personalized':
        return <PersonalizedLearning teachingPlan={teachingPlan} />;
      case 'collaboration':
        return <CollaborationTools teachingPlan={teachingPlan} />;
      case 'grading':
        return <AutoGrading />;
      case 'templates':
        return <PremiumTemplates />;
      default:
        return <Analytics teachingPlan={teachingPlan} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg text-white p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">🎉 All Premium Features Unlocked!</h2>
          <p className="text-indigo-100">
            Enjoy full access to advanced AI teaching tools including Quiz Generator - completely free!
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  isActive 
                    ? `${tab.bgColor} ${tab.color} border-2 ${tab.borderColor}` 
                    : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="bg-white text-xs px-2 py-0.5 rounded-full font-bold">
                    ACTIVE
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Component */}
        <div className="transition-all duration-300">
          {renderActiveComponent()}
        </div>
      </div>
    </div>
  );
};

export default FeatureTabs;
