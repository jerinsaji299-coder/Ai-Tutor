import React, { useState } from 'react';
import { Youtube, FileDown, BookOpen, Clock, ExternalLink, Loader2, Video as VideoIcon } from 'lucide-react';
import axios from 'axios';
import { TeachingPlan } from '../types';

interface Video {
  title: string;
  url: string;
  duration: string;
  summary: string;
  channelTitle?: string;
  hasTranscript?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface Props {
  teachingPlan: TeachingPlan;
}

const VideoEnhancement: React.FC<Props> = ({ teachingPlan }) => {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Get the selected week plan
  const selectedWeekPlan = selectedWeek 
    ? teachingPlan.semester_plan.find(w => w.week === selectedWeek)
    : null;

  /**
   * Fetch videos for the selected module/week
   */
  const handleGetVideos = async () => {
    if (!selectedWeekPlan) {
      setError('Please select a module first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/youtube/get-week-videos`, {
        weekNumber: selectedWeekPlan.week,
        weekTopic: selectedWeekPlan.topics,
        weekContent: selectedWeekPlan.activities,
        learningObjectives: []
      });

      setVideos(response.data.videos || []);
      
      if (response.data.videos && response.data.videos.length === 0) {
        setError('No videos found for this topic. Try selecting a different module.');
      }
    } catch (err: any) {
      console.error('Error fetching videos:', err);
      setError(err.response?.data?.error || 'Failed to fetch videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate PDF study notes from videos
   */
  const handleGeneratePdf = async () => {
    if (!selectedWeekPlan || videos.length === 0) {
      setError('Please fetch videos first before generating PDF');
      return;
    }

    setGeneratingPdf(true);
    setError(null);

    try {
      // Generate the PDF
      const generateResponse = await axios.post(`${API_BASE_URL}/youtube/generate-week-pdf`, {
        weekNumber: selectedWeekPlan.week,
        weekTopic: selectedWeekPlan.topics,
        videos: videos
      });

      const filename = generateResponse.data.filename;

      // Download the PDF
      const downloadResponse = await axios.get(
        `${API_BASE_URL}/youtube/download-pdf/${filename}`,
        { responseType: 'blob' }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([downloadResponse.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err: any) {
      console.error('Error generating PDF:', err);
      setError(err.response?.data?.error || 'Failed to generate PDF. Please try again.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-3">
          <Youtube className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Video Enhancement</h2>
            <p className="text-red-100 mt-1">
              Select a module to get curated YouTube videos with AI-powered summaries
            </p>
          </div>
        </div>
      </div>

      {/* Module Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          Select Module
        </h3>

        <div className="space-y-4">
          {/* Course Information */}
          {teachingPlan.metadata && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Subject:</span>
                  <p className="text-gray-900">{teachingPlan.metadata.subject}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Grade:</span>
                  <p className="text-gray-900">{teachingPlan.metadata.grade}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Duration:</span>
                  <p className="text-gray-900">{teachingPlan.metadata.total_weeks} weeks</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Total Modules:</span>
                  <p className="text-gray-900">{teachingPlan.semester_plan.length}</p>
                </div>
              </div>
            </div>
          )}

          {/* Module Dropdown */}
          <div>
            <label htmlFor="module-select" className="block text-sm font-medium text-gray-700 mb-2">
              Choose a Module/Week <span className="text-red-500">*</span>
            </label>
            <select
              id="module-select"
              value={selectedWeek || ''}
              onChange={(e) => {
                setSelectedWeek(Number(e.target.value));
                setVideos([]); // Clear previous videos
                setError(null);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Select a Module --</option>
              {teachingPlan.semester_plan.map((week) => (
                <option key={week.week} value={week.week}>
                  Week {week.week}: {week.topics}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Module Details */}
          {selectedWeekPlan && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                Week {selectedWeekPlan.week}: {selectedWeekPlan.topics}
              </h4>
              <p className="text-sm text-gray-700 mb-4">
                <span className="font-medium">Activities:</span> {selectedWeekPlan.activities}
              </p>

              <button
                onClick={handleGetVideos}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Fetching Videos...
                  </>
                ) : (
                  <>
                    <VideoIcon className="w-5 h-5" />
                    Get YouTube Videos
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Video Results */}
      {videos.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <VideoIcon className="w-5 h-5 text-red-600" />
              Video Resources ({videos.length})
            </h3>
            <button
              onClick={handleGeneratePdf}
              disabled={generatingPdf}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              {generatingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  Download PDF Study Notes
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Video Thumbnail */}
                <div className="aspect-video bg-gray-100 relative">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.url.split('v=')[1]?.split('&')[0]}`}
                    title={video.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {video.title}
                  </h4>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    {video.channelTitle && (
                      <span className="flex items-center gap-1">
                        <Youtube className="w-4 h-4" />
                        {video.channelTitle}
                      </span>
                    )}
                    {video.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {video.duration}
                      </span>
                    )}
                  </div>

                  {video.hasTranscript && (
                    <div className="bg-green-50 border border-green-200 text-green-700 text-xs px-2 py-1 rounded mb-3 inline-block">
                      ✓ Transcript Available
                    </div>
                  )}

                  {video.summary && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {video.summary}
                      </p>
                    </div>
                  )}

                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Watch on YouTube
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedWeek && videos.length === 0 && !loading && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <VideoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Module Selected
          </h3>
          <p className="text-gray-600">
            Select a module from the dropdown above to get started with video resources
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoEnhancement;
