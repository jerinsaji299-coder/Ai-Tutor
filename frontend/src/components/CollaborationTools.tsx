import React, { useState } from 'react';
import { Users, Share2, Mail, Copy, CheckCircle, Download, MessageSquare } from 'lucide-react';
import { TeachingPlan } from '../types';

interface Props {
  teachingPlan: TeachingPlan;
}

const CollaborationTools: React.FC<Props> = ({ teachingPlan }) => {
  const [copied, setCopied] = useState(false);
  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/shared/${teachingPlan.metadata?.subject}-${teachingPlan.metadata?.grade}`;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareViaEmail = () => {
    if (newEmail && newEmail.includes('@')) {
      setSharedWith([...sharedWith, newEmail]);
      setNewEmail('');
      // In a real app, this would send an email
      alert(`Teaching plan shared with ${newEmail}`);
    }
  };

  const exportToWord = () => {
    // Create a downloadable document
    const content = `
TEACHING PLAN: ${teachingPlan.metadata?.subject} - Grade ${teachingPlan.metadata?.grade}
Duration: ${teachingPlan.metadata?.duration} weeks

WEEKLY SCHEDULE:
${teachingPlan.semester_plan.map(week => 
  `Week ${week.week}: ${week.topics}\nActivities: ${week.activities}\n`
).join('\n')}

LESSON AIDS:
${teachingPlan.lesson_aids.map((aid, i) => `${i + 1}. ${aid}`).join('\n')}

ASSESSMENTS:
${teachingPlan.assessments.map((assessment, i) => `${i + 1}. ${assessment}`).join('\n')}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${teachingPlan.metadata?.subject}_Grade${teachingPlan.metadata?.grade}_Plan.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Users className="h-6 w-6 text-green-600" />
        <h3 className="text-xl font-bold text-gray-900">Collaboration Tools</h3>
        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          FREE
        </span>
      </div>

      <div className="space-y-6">
        {/* Share via Link */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center space-x-2">
            <Share2 className="h-4 w-4" />
            <span>Share via Link</span>
          </h4>
          <div className="flex space-x-2">
            <input
              type="text"
              value={`${window.location.origin}/shared/${teachingPlan.metadata?.subject}-${teachingPlan.metadata?.grade}`}
              readOnly
              className="flex-1 p-2 border border-gray-300 rounded text-sm bg-gray-50"
            />
            <button
              onClick={handleCopyLink}
              className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Share via Email */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>Share via Email</span>
          </h4>
          <div className="flex space-x-2 mb-3">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="colleague@school.edu"
              className="flex-1 p-2 border border-gray-300 rounded text-sm"
            />
            <button
              onClick={handleShareViaEmail}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm"
            >
              Share
            </button>
          </div>
          {sharedWith.length > 0 && (
            <div className="text-sm">
              <p className="text-gray-600 mb-1">Shared with:</p>
              <ul className="space-y-1">
                {sharedWith.map((email, index) => (
                  <li key={index} className="text-green-600 flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>{email}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Export Options */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export & Download</span>
          </h4>
          <div className="flex space-x-2">
            <button
              onClick={exportToWord}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
            >
              <Download className="h-4 w-4" />
              <span>Download as Text</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Team Comments</span>
          </h4>
          <div className="text-sm text-gray-500 italic">
            No comments yet. Share this plan to start collaborating!
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationTools;
