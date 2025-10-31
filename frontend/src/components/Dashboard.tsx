import React from 'react';
import { Calendar, BookOpen, FileText, Download, RotateCcw } from 'lucide-react';
import jsPDF from 'jspdf';
import { TeachingPlan } from '../types';
import FeatureTabs from './FeatureTabs';

interface Props {
  teachingPlan: TeachingPlan;
  onReset: () => void;
}

const Dashboard: React.FC<Props> = ({ teachingPlan, onReset }) => {
  console.log('🎯 Dashboard rendering with teachingPlan:', teachingPlan);
  console.log('📊 teachingPlan type:', typeof teachingPlan);
  console.log('📋 teachingPlan keys:', Object.keys(teachingPlan || {}));
  
  // Add safety checks
  if (!teachingPlan) {
    console.warn('⚠️ Dashboard: teachingPlan is null/undefined');
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-lg m-4">
        <div className="text-center p-8">
          <p className="text-gray-600">Loading teaching plan...</p>
        </div>
      </div>
    );
  }

  const { semester_plan, lesson_aids, assessments, metadata } = teachingPlan;
  
  console.log('📚 semester_plan:', semester_plan);
  console.log('📚 semester_plan length:', semester_plan?.length);
  console.log('🎯 lesson_aids:', lesson_aids);
  console.log('📝 assessments:', assessments);
  console.log('ℹ️ metadata:', metadata);

  // Validate semester_plan exists
  if (!semester_plan || !Array.isArray(semester_plan) || semester_plan.length === 0) {
    console.error('❌ Invalid semester_plan:', semester_plan);
    console.error('❌ Full teachingPlan object:', JSON.stringify(teachingPlan, null, 2));
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-lg m-4">
        <div className="text-center p-8">
          <p className="text-red-600 font-semibold text-xl mb-2">Error: Invalid teaching plan format</p>
          <p className="text-gray-600 mt-2">semester_plan is missing or empty</p>
          <p className="text-gray-500 text-sm mt-2">Check browser console for details</p>
          <button
            onClick={onReset}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  console.log('✅ Dashboard validation passed, rendering content');

  const downloadPDF = () => {
    const pdf = new jsPDF();
    const pageHeight = pdf.internal.pageSize.height;
    let yPosition = 20;

    // Title
    pdf.setFontSize(20);
    pdf.text(`${metadata?.subject} - Grade ${metadata?.grade}`, 20, yPosition);
    yPosition += 15;

    pdf.setFontSize(12);
    pdf.text(`Semester Plan (${metadata?.duration} weeks)`, 20, yPosition);
    yPosition += 20;

    // Semester Plan
    pdf.setFontSize(16);
    pdf.text('📅 Weekly Schedule', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    semester_plan.forEach((week) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.text(`Week ${week.week}: ${week.topics}`, 20, yPosition);
      yPosition += 7;
      const activities = pdf.splitTextToSize(week.activities, 160);
      pdf.text(activities, 25, yPosition);
      yPosition += activities.length * 5 + 5;
    });

    // New page for aids and assessments
    pdf.addPage();
    yPosition = 20;

    // Lesson Aids
    pdf.setFontSize(16);
    pdf.text('🎯 Lesson Aids', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    lesson_aids.forEach((aid) => {
      pdf.text(`• ${aid}`, 25, yPosition);
      yPosition += 7;
    });

    yPosition += 10;

    // Assessments
    pdf.setFontSize(16);
    pdf.text('📊 Assessments', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    assessments.forEach((assessment) => {
      pdf.text(`• ${assessment}`, 25, yPosition);
      yPosition += 7;
    });

    pdf.save(`${metadata?.subject}_Grade${metadata?.grade}_Plan.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {metadata?.subject} Teaching Plan
            </h2>
            <p className="text-gray-600">
              Grade {metadata?.grade} • {metadata?.duration} weeks • Generated {new Date(metadata?.generated_at || '').toLocaleDateString()}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={downloadPDF}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onReset}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>New Plan</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Schedule */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Weekly Schedule</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {semester_plan.map((week) => (
                <div 
                  key={week.week} 
                  className="border-l-4 border-indigo-500 pl-6 py-4 bg-gradient-to-r from-indigo-50/50 to-transparent rounded-r-lg hover:from-indigo-50 transition-all duration-200"
                >
                  <div className="flex items-start space-x-3 mb-3">
                    <span className="bg-indigo-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-sm flex-shrink-0">
                      Week {week.week}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-base leading-relaxed">
                        {week.topics}
                      </h4>
                    </div>
                  </div>
                  <div className="ml-0 mt-3">
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {week.activities}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lesson Aids & Assessments */}
        <div className="space-y-6">
          {/* Lesson Aids */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Lesson Aids</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">Recommended teaching resources</p>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {(lesson_aids && Array.isArray(lesson_aids) && lesson_aids.length > 0 ? lesson_aids : [
                  "PowerPoint presentations",
                  "Interactive video tutorials",
                  "Hands-on worksheets",
                  "Online coding platforms",
                  "Reference materials"
                ]).map((aid, index) => (
                  <li key={index} className="flex items-start space-x-3 group">
                    <span className="text-green-500 text-xl mt-0.5 group-hover:scale-125 transition-transform">•</span>
                    <span className="text-gray-700 text-sm leading-relaxed flex-1">{aid}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Assessments */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b bg-gradient-to-r from-orange-50 to-amber-50">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">Assessments</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">Evaluation strategies</p>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {(assessments && Array.isArray(assessments) && assessments.length > 0 ? assessments : [
                  "Weekly quizzes to track progress",
                  "Mid-term project evaluation",
                  "Practical coding assignments",
                  "Final comprehensive exam"
                ]).map((assessment, index) => (
                  <li key={index} className="flex items-start space-x-3 group">
                    <span className="text-orange-500 text-xl mt-0.5 group-hover:scale-125 transition-transform">•</span>
                    <span className="text-gray-700 text-sm leading-relaxed flex-1">
                      {typeof assessment === 'string' ? assessment : JSON.stringify(assessment)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Features - Now Free! */}
      <FeatureTabs teachingPlan={teachingPlan} />
    </div>
  );
};

export default Dashboard;