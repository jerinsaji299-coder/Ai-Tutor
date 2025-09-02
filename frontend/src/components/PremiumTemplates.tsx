import React, { useState } from 'react';
import { Star, Download, Search, Filter, BookOpen, Code, Calculator, Microscope, Globe, Palette } from 'lucide-react';

interface Template {
  id: string;
  title: string;
  subject: string;
  grade: string;
  description: string;
  icon: any;
  color: string;
  downloads: number;
  rating: number;
}

const PremiumTemplates: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const templates: Template[] = [
    {
      id: '1',
      title: 'Interactive Computer Science Curriculum',
      subject: 'Computer Science',
      grade: '9-12',
      description: 'Complete CS curriculum with coding projects, algorithms, and web development',
      icon: Code,
      color: 'bg-blue-500',
      downloads: 1234,
      rating: 4.8
    },
    {
      id: '2',
      title: 'Advanced Mathematics Learning Path',
      subject: 'Mathematics',
      grade: '10-12',
      description: 'Comprehensive math program covering algebra, calculus, and statistics',
      icon: Calculator,
      color: 'bg-green-500',
      downloads: 987,
      rating: 4.7
    },
    {
      id: '3',
      title: 'Biology Laboratory Experiments',
      subject: 'Biology',
      grade: '9-11',
      description: 'Hands-on biology experiments and lab activities with safety protocols',
      icon: Microscope,
      color: 'bg-purple-500',
      downloads: 756,
      rating: 4.9
    },
    {
      id: '4',
      title: 'World History Timeline Project',
      subject: 'History',
      grade: '6-12',
      description: 'Interactive timeline activities covering major historical events',
      icon: Globe,
      color: 'bg-orange-500',
      downloads: 543,
      rating: 4.6
    },
    {
      id: '5',
      title: 'Creative Writing Workshop',
      subject: 'English',
      grade: '7-12',
      description: 'Structured writing exercises and creative storytelling techniques',
      icon: BookOpen,
      color: 'bg-indigo-500',
      downloads: 892,
      rating: 4.8
    },
    {
      id: '6',
      title: 'Digital Art & Design Fundamentals',
      subject: 'Art',
      grade: '8-12',
      description: 'Modern art techniques using digital tools and traditional methods',
      icon: Palette,
      color: 'bg-pink-500',
      downloads: 432,
      rating: 4.5
    }
  ];

  const subjects = ['all', 'Computer Science', 'Mathematics', 'Biology', 'History', 'English', 'Art'];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || template.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const downloadTemplate = (template: Template) => {
    // Simulate template download
    alert(`Downloading "${template.title}" template...`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Star className="h-6 w-6 text-yellow-600" />
        <h3 className="text-xl font-bold text-gray-900">Premium Templates</h3>
        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          FREE ACCESS
        </span>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            {subjects.map(subject => (
              <option key={subject} value={subject}>
                {subject === 'all' ? 'All Subjects' : subject}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => {
          const IconComponent = template.icon;
          return (
            <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-2 rounded-lg ${template.color}`}>
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm">{template.title}</h4>
                  <p className="text-xs text-gray-500">{template.subject} • Grade {template.grade}</p>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{template.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(template.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span>{template.rating}</span>
                  </div>
                  <span>•</span>
                  <span>{template.downloads} downloads</span>
                </div>
                
                <button
                  onClick={() => downloadTemplate(template)}
                  className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-3 w-3" />
                  <span>Use</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No templates found matching your criteria.</p>
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
            <p className="text-sm text-gray-600">Premium Templates</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{subjects.length - 1}</p>
            <p className="text-sm text-gray-600">Subject Areas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {templates.reduce((sum, t) => sum + t.downloads, 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total Downloads</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumTemplates;
