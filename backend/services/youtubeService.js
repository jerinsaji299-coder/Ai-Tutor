import aiOrchestrator from './aiOrchestrator.js';
import axios from 'axios';
import { YoutubeTranscript } from 'youtube-transcript';

class YouTubeService {
  constructor() {
    this.baseUrl = 'https://www.youtube.com';
    this.apiKey = process.env.YOUTUBE_API_KEY;
    this.apiBaseUrl = 'https://www.googleapis.com/youtube/v3';
    
    console.log('🎥 YouTube Service initialized');
    console.log('🔑 API Key present:', !!this.apiKey);
    console.log('🔑 API Key length:', this.apiKey ? this.apiKey.length : 0);
    
    if (!this.apiKey || this.apiKey === 'YOUR_YOUTUBE_API_KEY_HERE') {
      console.warn('⚠️ YouTube API key not configured. Using fallback mode.');
      this.useApiKey = false;
    } else {
      this.useApiKey = true;
      console.log('✅ YouTube API key configured - will use real YouTube Data API');
    }
  }

  /**
   * Search for real YouTube videos using YouTube Data API
   */
  async searchVideos(topic, weekContent = '', maxResults = 5) {
    try {
      console.log(`🔍 Searching YouTube for: ${topic}`);
      if (weekContent) {
        console.log(`📄 Using content context: ${weekContent.substring(0, 100)}...`);
      }

      // Build search query from topic and content
      const searchQuery = this.buildSearchQuery(topic, weekContent);
      console.log(`🔎 Search query: ${searchQuery}`);

      if (this.useApiKey) {
        // Use YouTube Data API to get real videos
        return await this.searchWithAPI(searchQuery, maxResults);
      } else {
        // Fallback: Use youtube-search-api package (no API key needed)
        return await this.searchWithoutAPI(searchQuery, maxResults);
      }

    } catch (error) {
      console.error('❌ Error searching YouTube:', error);
      return this.getFallbackVideos(topic);
    }
  }

  /**
   * Build optimized search query from topic and content
   */
  buildSearchQuery(topic, weekContent) {
    if (weekContent && weekContent.length > 50) {
      const keywords = this.extractKeywordsFromContent(weekContent);
      // Combine topic with top 2 keywords
      return `${topic} ${keywords.slice(0, 2).join(' ')} tutorial`;
    }
    return `${topic} tutorial complete guide`;
  }

  /**
   * Search using YouTube Data API (with API key)
   */
  async searchWithAPI(query, maxResults) {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/search`, {
        params: {
          part: 'snippet',
          q: query,
          type: 'video',
          maxResults: maxResults,
          key: this.apiKey,
          videoDuration: 'medium', // 4-20 minutes
          videoDefinition: 'high',
          relevanceLanguage: 'en',
          order: 'relevance'
        }
      });

      const videos = response.data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnail: item.snippet.thumbnails.high.url,
        description: item.snippet.description,
        isSearchLink: false
      }));

      // Get video durations
      const videosWithDuration = await this.getVideoDurations(videos);

      console.log(`✅ Found ${videosWithDuration.length} real videos`);
      return videosWithDuration;

    } catch (error) {
      console.error('❌ YouTube API error:', error.message);
      throw error;
    }
  }

  /**
   * Get video durations from YouTube Data API
   */
  async getVideoDurations(videos) {
    if (!this.useApiKey || videos.length === 0) return videos;

    try {
      const videoIds = videos.map(v => v.id).join(',');
      
      const response = await axios.get(`${this.apiBaseUrl}/videos`, {
        params: {
          part: 'contentDetails,statistics',
          id: videoIds,
          key: this.apiKey
        }
      });

      // Map durations back to videos
      return videos.map(video => {
        const videoData = response.data.items.find(item => item.id === video.id);
        if (videoData) {
          return {
            ...video,
            duration: this.parseDuration(videoData.contentDetails.duration),
            viewCount: videoData.statistics.viewCount,
            likeCount: videoData.statistics.likeCount
          };
        }
        return video;
      });

    } catch (error) {
      console.error('❌ Error getting video durations:', error);
      return videos;
    }
  }

  /**
   * Parse ISO 8601 duration to readable format
   */
  parseDuration(isoDuration) {
    const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    
    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');

    if (hours) {
      return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    } else if (minutes) {
      return `${minutes}:${seconds.padStart(2, '0')}`;
    } else {
      return `0:${seconds.padStart(2, '0')}`;
    }
  }

  /**
   * Search without API key using youtube-search-api
   */
  async searchWithoutAPI(query, maxResults) {
    try {
      console.log('🔍 Using youtube-search-api fallback method...');
      
      try {
        const { default: youtubeSearch } = await import('youtube-search-api');
        
        const result = await youtubeSearch.GetListByKeyword(query, false, maxResults);
        
        const videos = result.items.map(item => ({
          id: item.id,
          title: item.title,
          url: `https://www.youtube.com/watch?v=${item.id}`,
          channelTitle: item.channelTitle,
          thumbnail: item.thumbnail.thumbnails[item.thumbnail.thumbnails.length - 1].url,
          description: item.description || '',
          duration: item.length?.simpleText || 'Unknown',
          viewCount: item.viewCount || '0',
          isSearchLink: false
        }));

        console.log(`✅ Found ${videos.length} videos (no API key)`);
        return videos;
      } catch (importError) {
        console.error('❌ youtube-search-api not available:', importError.message);
        console.log('🔄 Using basic fallback videos...');
        return this.getFallbackVideos(query);
      }

    } catch (error) {
      console.error('❌ Error with youtube-search-api:', error);
      return this.getFallbackVideos(query);
    }
  }

  /**
   * Extract key keywords from content for better video search
   */
  extractKeywordsFromContent(content) {
    // Simple keyword extraction from content
    const words = content
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 4); // Only words longer than 4 chars

    // Remove common words
    const stopWords = ['introduction', 'understanding', 'learning', 'studying', 'explore', 'students', 'topics', 'concepts', 'learn', 'teach'];
    const filtered = words.filter(word => !stopWords.includes(word));

    // Get most relevant unique keywords (first few)
    const unique = [...new Set(filtered)];
    return unique.slice(0, 3);
  }

  /**
   * Get video transcript from YouTube
   */
  async getVideoTranscript(videoId) {
    try {
      console.log(`📝 Fetching transcript for video: ${videoId}`);
      
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      
      // Combine all transcript parts into one text
      const fullText = transcript.map(item => item.text).join(' ');
      
      console.log(`✅ Transcript fetched: ${fullText.length} characters`);
      return fullText;

    } catch (error) {
      console.error(`❌ Error fetching transcript for ${videoId}:`, error.message);
      return null;
    }
  }

  /**
   * Generate AI summary from video transcript
   */
  async generateVideoSummary(videoInfo, weekTopic, learningObjectives = []) {
    try {
      console.log(`🤖 Generating AI summary for: ${videoInfo.title}`);

      // Try to get transcript first
      const transcript = await this.getVideoTranscript(videoInfo.id);

      let summaryPrompt;

      if (transcript && transcript.length > 100) {
        // Generate summary from actual transcript
        summaryPrompt = `Analyze this YouTube video transcript and create a concise educational summary.

VIDEO TITLE: ${videoInfo.title}
TOPIC CONTEXT: ${weekTopic}
LEARNING OBJECTIVES: ${learningObjectives.join(', ')}

TRANSCRIPT (first 2000 chars):
${transcript.substring(0, 2000)}

Create a 2-3 sentence summary that explains:
1. What the video teaches
2. Key concepts covered
3. Why it's relevant to the topic "${weekTopic}"

Keep it student-friendly and informative.`;

      } else {
        // Generate summary from title and description
        summaryPrompt = `Create an educational summary for this YouTube video.

VIDEO TITLE: ${videoInfo.title}
CHANNEL: ${videoInfo.channelTitle}
DESCRIPTION: ${videoInfo.description.substring(0, 300)}
TOPIC CONTEXT: ${weekTopic}
LEARNING OBJECTIVES: ${learningObjectives.join(', ')}

Create a 2-3 sentence summary explaining:
1. What this video likely teaches about ${weekTopic}
2. Why it's relevant for students
3. Who should watch it (beginner/intermediate/advanced)`;
      }

      const summary = await aiOrchestrator.distributeTask('text-generation', summaryPrompt);

      return {
        ...videoInfo,
        summary: summary || `This video provides comprehensive coverage of ${weekTopic}, explaining key concepts with practical examples and step-by-step guidance.`,
        hasTranscript: transcript !== null,
        transcriptLength: transcript ? transcript.length : 0
      };

    } catch (error) {
      console.error('❌ Error generating video summary:', error);
      return {
        ...videoInfo,
        summary: `Educational content covering ${weekTopic} with clear explanations and practical examples.`,
        hasTranscript: false,
        transcriptLength: 0
      };
    }
  }

  /**
   * Generate comprehensive study notes from video transcripts
   */
  async generateStudyNotesFromVideos(weekData, videos) {
    try {
      console.log(`📚 Generating study notes from ${videos.length} videos...`);

      // Collect transcripts from all videos
      const transcripts = [];
      
      for (const video of videos) {
        const transcript = await this.getVideoTranscript(video.id);
        if (transcript && transcript.length > 100) {
          transcripts.push({
            title: video.title,
            transcript: transcript.substring(0, 3000) // Limit per video
          });
        }
      }

      if (transcripts.length === 0) {
        console.warn('⚠️ No transcripts available, using fallback notes');
        return this.generateFallbackNotes(weekData);
      }

      // Generate comprehensive notes from transcripts
      const notesPrompt = `You are an educational content creator. Analyze these YouTube video transcripts and create comprehensive study notes.

TOPIC: ${weekData.topic}
WEEK CONTENT: ${weekData.content || ''}
LEARNING OBJECTIVES:
${(weekData.learning_objectives || []).map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

VIDEO TRANSCRIPTS:
${transcripts.map((t, i) => `
VIDEO ${i + 1}: ${t.title}
TRANSCRIPT: ${t.transcript}
`).join('\n---\n')}

Create comprehensive study notes with these sections:

📘 INTRODUCTION
(2-3 sentences introducing the topic)

🎯 KEY CONCEPTS
(List 5-7 main concepts from the videos with brief explanations)

📖 DETAILED EXPLANATION
(3-4 paragraphs synthesizing information from all videos)

💡 PRACTICAL APPLICATIONS
(How to apply these concepts in real-world scenarios)

⚠️ COMMON MISTAKES
(Based on what videos emphasize to avoid)

✅ STUDY TIPS
(Specific recommendations from the video content)

📋 QUICK SUMMARY
(2-3 sentence recap)

Make it comprehensive, student-friendly, and based on actual video content.`;

      const generatedNotes = await aiOrchestrator.distributeTask('text-generation', notesPrompt);

      return {
        generatedNotes: generatedNotes || this.generateFallbackNotes(weekData).generatedNotes,
        basedOnTranscripts: true,
        transcriptCount: transcripts.length,
        videoTitles: transcripts.map(t => t.title)
      };

    } catch (error) {
      console.error('❌ Error generating study notes from videos:', error);
      return this.generateFallbackNotes(weekData);
    }
  }

  /**
   * Generate curated YouTube search links and video data (old method for backward compatibility)
   */
  generateCuratedVideoLinksOld(topic, maxResults) {
    const searchQuery = encodeURIComponent(`${topic} tutorial educational explanation`);
    const videos = [];

    // Create multiple search variations for better coverage
    const searchVariations = [
      `${topic} tutorial for beginners`,
      `${topic} explained simply`,
      `${topic} crash course`,
      `${topic} step by step guide`,
      `${topic} complete tutorial`
    ];

    for (let i = 0; i < Math.min(maxResults, searchVariations.length); i++) {
      const query = encodeURIComponent(searchVariations[i]);
      videos.push({
        id: `search_${i}_${Date.now()}`,
        title: searchVariations[i].charAt(0).toUpperCase() + searchVariations[i].slice(1),
        url: `https://www.youtube.com/results?search_query=${query}`,
        searchUrl: `https://www.youtube.com/results?search_query=${query}`,
        thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg`,
        channelTitle: 'Educational Channels',
        duration: 'Varies',
        description: `Comprehensive tutorial covering ${topic} with practical examples and detailed explanations.`,
        isSearchLink: true
      });
    }

    return videos;
  }

  /**
   * Generate AI summary of video content based on title and description
   */
  async generateVideoSummary(videoInfo) {
    try {
      console.log(`🤖 Generating AI summary for: ${videoInfo.title}`);

      const summaryPrompt = `Create an educational summary for a YouTube video with this information:

Title: ${videoInfo.title}
Topic: ${videoInfo.description}

Provide a concise 3-4 sentence summary that includes:
1. What the video covers
2. Key learning outcomes
3. Who should watch this (beginner/intermediate/advanced)
4. Main concepts explained

Keep it informative and student-friendly.`;

      const summary = await AIOrchestrator.distributeTask('text-generation', summaryPrompt);
      
      return {
        ...videoInfo,
        summary: summary || `This video provides a comprehensive introduction to ${videoInfo.title.split(' ')[0]}, covering fundamental concepts, practical applications, and step-by-step guidance for learners at all levels.`,
        hasTranscript: false,
        generatedSummary: true
      };

    } catch (error) {
      console.error('❌ Error generating video summary:', error);
      return {
        ...videoInfo,
        summary: `Educational content covering ${videoInfo.title.split(' ')[0]} with clear explanations and practical examples suitable for students.`,
        hasTranscript: false,
        generatedSummary: false
      };
    }
  }

  /**
   * Fallback videos when search fails
   */
  getFallbackVideos(topic) {
    const searchQuery = encodeURIComponent(`${topic} tutorial`);
    return [
      {
        id: 'fallback_1',
        title: `${topic} - Complete Tutorial`,
        url: `https://www.youtube.com/results?search_query=${searchQuery}`,
        searchUrl: `https://www.youtube.com/results?search_query=${searchQuery}`,
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        channelTitle: 'Educational Content',
        duration: 'Varies',
        description: `Comprehensive coverage of ${topic}`,
        summary: `Educational video covering ${topic} fundamentals with practical examples.`,
        isSearchLink: true
      }
    ];
  }

  /**
   * Get curated video recommendations for entire curriculum
   */
  async getCurriculumVideos(teachingPlan) {
    try {
      console.log('🎬 Generating video recommendations for curriculum...');
      
      const weeklyVideos = {};

      // Process each week
      for (const week of teachingPlan.weeks) {
        console.log(`📹 Finding videos for Week ${week.week}: ${week.topic}`);
        console.log(`📄 Content: ${week.content ? week.content.substring(0, 80) + '...' : 'No content'}`);
        
        // Search for videos using topic and content
        const videos = await this.searchVideos(week.topic, week.content || '', 3);
        
        // Generate AI summaries for each video with context
        const videosWithSummaries = await Promise.all(
          videos.map(video => 
            this.generateVideoSummary(
              video, 
              week.topic, 
              week.learning_objectives || []
            )
          )
        );

        weeklyVideos[`week${week.week}`] = {
          weekNumber: week.week,
          topic: week.topic,
          content: week.content,
          videos: videosWithSummaries
        };

        // Small delay to prevent overwhelming the system
        await this.delay(500);
      }

      console.log(`✅ Video recommendations generated for ${Object.keys(weeklyVideos).length} weeks`);
      return weeklyVideos;

    } catch (error) {
      console.error('❌ Error generating curriculum videos:', error);
      throw error;
    }
  }

  /**
   * Generate study notes with video references
   */
  async generateStudyNotes(weekData, videos) {
    try {
      console.log(`📝 Generating study notes for: ${weekData.topic}`);

      const notesPrompt = `Create comprehensive study notes for this topic:

Topic: ${weekData.topic}
Week: ${weekData.week}
Description: ${weekData.content || 'Core concepts and applications'}
Learning Objectives: ${weekData.learning_objectives?.join(', ') || 'Master key concepts'}

Generate structured study notes with:
1. 📘 Introduction (2-3 sentences overview)
2. 🎯 Key Concepts (5-7 main points with brief explanations)
3. 📖 Important Terms (glossary of 4-5 key terms)
4. 💡 Practical Examples (2-3 real-world applications)
5. ⚠️ Common Mistakes (3-4 things to avoid)
6. ✅ Study Tips (3-4 effective learning strategies)
7. 📋 Quick Summary (one paragraph recap)

Format clearly with headers and bullet points.`;

      const aiNotes = await AIOrchestrator.distributeTask('complex-questions', notesPrompt);

      const notes = {
        topic: weekData.topic,
        week: weekData.week,
        generatedNotes: aiNotes || this.generateFallbackNotes(weekData),
        videos: videos,
        objectives: weekData.learning_objectives || [],
        activities: weekData.activities || [],
        timestamp: new Date().toISOString()
      };

      console.log(`✅ Study notes generated for Week ${weekData.week}`);
      return notes;

    } catch (error) {
      console.error('❌ Error generating study notes:', error);
      return {
        topic: weekData.topic,
        week: weekData.week,
        generatedNotes: this.generateFallbackNotes(weekData),
        videos: videos,
        objectives: weekData.learning_objectives || [],
        activities: weekData.activities || []
      };
    }
  }

  /**
   * Generate fallback notes if AI fails
   */
  generateFallbackNotes(weekData) {
    return `
📘 INTRODUCTION
${weekData.topic} is a fundamental topic that covers essential concepts and practical applications. This week focuses on building a strong foundation and understanding real-world use cases.

🎯 KEY CONCEPTS
• Core principles of ${weekData.topic}
• Fundamental theories and frameworks
• Practical applications and examples
• Best practices and methodologies
• Common patterns and techniques
• Problem-solving approaches
• Real-world implementations

📖 IMPORTANT TERMS
• ${weekData.topic}: Primary subject of study with wide applications
• Fundamentals: Basic building blocks and core principles
• Applications: Practical uses in real-world scenarios
• Methodology: Systematic approach to learning and implementation

💡 PRACTICAL EXAMPLES
• Industry applications demonstrating ${weekData.topic} in action
• Step-by-step walkthroughs of common scenarios
• Case studies showing successful implementations

⚠️ COMMON MISTAKES TO AVOID
• Rushing through fundamentals without proper understanding
• Skipping practical exercises and hands-on practice
• Not connecting theory to real-world applications
• Ignoring best practices and established patterns

✅ STUDY TIPS
• Review concepts multiple times with increasing complexity
• Practice with real examples and exercises
• Connect new learning to previously covered topics
• Use multiple resources including videos and documentation

📋 QUICK SUMMARY
${weekData.topic} encompasses important concepts that form the foundation for advanced learning. Focus on understanding core principles, practice with examples, and connect theory to practical applications for comprehensive mastery.
    `;
  }

  /**
   * Delay helper for rate limiting
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export the class, not an instance, to allow lazy initialization
export default YouTubeService;
