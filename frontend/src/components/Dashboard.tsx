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
  const { semester_plan, lesson_aids, assessments, metadata } = teachingPlan;

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
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {semester_plan.map((week) => (
                <div key={week.week} className="border-l-4 border-indigo-500 pl-4 py-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-2 py-1 rounded">
                      Week {week.week}
                    </span>
                    <span className="font-medium text-gray-900">{week.topics}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{week.activities}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lesson Aids & Assessments */}
        <div className="space-y-6">
          {/* Lesson Aids */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Lesson Aids</h3>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-2">
                {lesson_aids.map((aid, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span className="text-gray-700 text-sm">{aid}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Assessments */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">Assessments</h3>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-2">
                {assessments.map((assessment, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span className="text-gray-700 text-sm">{assessment}</span>
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