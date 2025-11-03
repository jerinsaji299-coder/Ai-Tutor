import React, { useState } from 'react';
import { BookOpen, Download, Sparkles, FileText, Loader, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import { TeachingPlan } from '../types';

interface Props {
  teachingPlan: TeachingPlan;
}

interface GeneratedNote {
  weekNumber: number;
  topic: string;
  notes: string;
  generatedAt: string;
}

const StudyNotes: React.FC<Props> = ({ teachingPlan }) => {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [generatedNotes, setGeneratedNotes] = useState<Map<number, GeneratedNote>>(new Map());
  const [loading, setLoading] = useState(false);
  const [semesterSummary, setSemesterSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const handleGenerateNotes = async (weekNumber: number) => {
    console.log('🎬 handleGenerateNotes called for week:', weekNumber);
    
    setLoading(true);
    setSelectedWeek(weekNumber);

    try {
      const week = teachingPlan.semester_plan.find(w => w.week === weekNumber);
      
      if (!week) {
        console.error('❌ Week not found in teaching plan');
        throw new Error('Week not found');
      }

      console.log('📝 Generating study notes for week:', weekNumber);
      console.log('📋 Week data:', week);
      console.log('📊 Teaching plan metadata:', teachingPlan.metadata);

      const requestData = {
        weekNumber: week.week,
        topic: week.topics,
        activities: week.activities,
        learningObjectives: '',
        subject: teachingPlan.metadata?.subject || 'Unknown',
        grade: teachingPlan.metadata?.grade || 'Unknown'
      };

      console.log('🚀 Sending request to /study-notes/generate:', requestData);

      const response = await api.post('/api/study-notes/generate', requestData);

      console.log('✅ Response received:', response);

      const newNote: GeneratedNote = {
        weekNumber,
        topic: week.topics,
        notes: (response.data as any).notes,
        generatedAt: (response.data as any).generatedAt
      };

      setGeneratedNotes(prev => new Map(prev).set(weekNumber, newNote));
      console.log('✅ Study notes generated successfully');

    } catch (error: any) {
      console.error('❌ Error generating study notes:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error message:', error.message);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate study notes';
      alert(`Failed to generate study notes: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSemesterSummary = async () => {
    setLoadingSummary(true);

    try {
      console.log('📚 Generating semester summary...');

      const response = await api.post('/api/study-notes/generate-semester-summary', {
        semesterPlan: teachingPlan.semester_plan,
        subject: teachingPlan.metadata?.subject || 'Unknown',
        grade: teachingPlan.metadata?.grade || 'Unknown'
      });

      setSemesterSummary((response.data as any).summary);
      console.log('✅ Semester summary generated successfully');

    } catch (error: any) {
      console.error('❌ Error generating semester summary:', error);
      alert('Failed to generate semester summary. Please try again.');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleDownloadNotes = (note: GeneratedNote) => {
    const blob = new Blob([note.notes], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Week-${note.weekNumber}-${note.topic.replace(/\s+/g, '-')}-Notes.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadSummary = () => {
    if (!semesterSummary) return;
    
    const blob = new Blob([semesterSummary], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${teachingPlan.metadata?.subject || 'Semester'}-Summary.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-8 h-8" />
          <h2 className="text-2xl font-bold">AI Study Notes Generator</h2>
        </div>
        <p className="text-blue-100">
          Generate comprehensive study notes for any week using AI ✨
        </p>
      </div>

      {/* Course Info */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Subject</p>
            <p className="text-lg font-semibold text-gray-800">{teachingPlan.metadata?.subject || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Grade</p>
            <p className="text-lg font-semibold text-gray-800">{teachingPlan.metadata?.grade || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Duration</p>
            <p className="text-lg font-semibold text-gray-800">{teachingPlan.metadata?.duration || teachingPlan.semester_plan.length} weeks</p>
          </div>
        </div>

        {/* Semester Summary Button */}
        <button
          onClick={handleGenerateSemesterSummary}
          disabled={loadingSummary}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loadingSummary ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Generating Semester Summary...
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              Generate Complete Semester Summary
            </>
          )}
        </button>
      </div>

      {/* Semester Summary Display */}
      {semesterSummary && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-600" />
              Semester Summary
            </h3>
            <button
              onClick={handleDownloadSummary}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
          <div className="prose max-w-none bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
            <div dangerouslySetInnerHTML={{ __html: semesterSummary.replace(/\n/g, '<br/>') }} />
          </div>
        </div>
      )}

      {/* Week Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-500" />
          Select a Week to Generate Notes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachingPlan.semester_plan.map((week) => {
            const hasNotes = generatedNotes.has(week.week);
            
            return (
              <div
                key={week.week}
                className={`border rounded-lg p-4 transition-all ${
                  hasNotes
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">Week {week.week}</h4>
                  {hasNotes && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{week.topics}</p>
                
                <button
                  onClick={() => handleGenerateNotes(week.week)}
                  disabled={loading && selectedWeek === week.week}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                    hasNotes
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                >
                  {loading && selectedWeek === week.week ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : hasNotes ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Regenerate Notes
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Notes
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Generated Notes Display */}
      {Array.from(generatedNotes.values()).map((note) => (
        <div key={note.weekNumber} className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              Week {note.weekNumber}: {note.topic}
            </h3>
            <button
              onClick={() => handleDownloadNotes(note)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>

          <div className="prose max-w-none bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
            <div dangerouslySetInnerHTML={{ __html: note.notes.replace(/\n/g, '<br/>') }} />
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Generated on {new Date(note.generatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudyNotes;
