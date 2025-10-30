import express from 'express';
import youtubeService from '../services/youtubeService.js';
import pdfService from '../services/pdfService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * POST /api/youtube/enhance-curriculum
 * Enhance entire teaching plan with YouTube videos and AI summaries
 */
router.post('/enhance-curriculum', async (req, res) => {
  try {
    console.log('🎥 Enhancing curriculum with YouTube videos...');
    
    const { teachingPlan } = req.body;

    if (!teachingPlan || !teachingPlan.weeks) {
      return res.status(400).json({
        success: false,
        error: 'Invalid teaching plan format'
      });
    }

    // Generate video recommendations for all weeks
    const enhancedData = await youtubeService.getCurriculumVideos(teachingPlan);

    res.json({
      success: true,
      message: 'Curriculum enhanced with video resources',
      data: enhancedData
    });

  } catch (error) {
    console.error('❌ Error enhancing curriculum:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to enhance curriculum'
    });
  }
});

/**
 * POST /api/youtube/get-week-videos
 * Get video recommendations for a specific week
 */
router.post('/get-week-videos', async (req, res) => {
  try {
    const { weekTopic, weekContent, learningObjectives } = req.body;

    if (!weekTopic) {
      return res.status(400).json({
        success: false,
        error: 'Week topic is required'
      });
    }

    console.log(`🔍 Searching videos for: ${weekTopic}`);

    // Search for videos
    const videos = await youtubeService.searchVideos(weekTopic, weekContent);

    // Generate AI summaries for each video
    const videosWithSummaries = [];
    
    for (const video of videos) {
      const videoWithSummary = await youtubeService.generateVideoSummary(
        video,
        weekTopic,
        learningObjectives
      );
      
      videosWithSummaries.push(videoWithSummary);
    }

    res.json({
      success: true,
      videos: videosWithSummaries
    });

  } catch (error) {
    console.error('❌ Error getting week videos:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get videos'
    });
  }
});

/**
 * POST /api/youtube/generate-week-pdf
 * Generate PDF notes for a specific week with videos and transcript analysis
 */
router.post('/generate-week-pdf', async (req, res) => {
  try {
    const { weekData, videos, generateNotes = true } = req.body;

    if (!weekData || !weekData.week || !weekData.topic) {
      return res.status(400).json({
        success: false,
        error: 'Invalid week data format'
      });
    }

    console.log(`📄 Generating PDF for Week ${weekData.week}...`);

    // Generate study notes from video transcripts if requested
    let studyNotes = {
      generatedNotes: 'Comprehensive study notes for this week\'s topics.',
      basedOnTranscripts: false
    };

    if (generateNotes && videos && videos.length > 0) {
      console.log(`🎥 Analyzing ${videos.length} video transcripts for study notes...`);
      studyNotes = await youtubeService.generateStudyNotesFromVideos(
        weekData,
        videos
      );
    }

    // Generate PDF
    const pdfResult = await pdfService.generateWeekPDF(
      weekData,
      videos || [],
      studyNotes
    );

    res.json({
      success: true,
      message: 'PDF generated successfully from video transcripts',
      filename: pdfResult.filename,
      downloadUrl: `/api/youtube/download-pdf/${pdfResult.filename}`,
      studyNotes: {
        basedOnTranscripts: studyNotes.basedOnTranscripts,
        transcriptCount: studyNotes.transcriptCount,
        videoTitles: studyNotes.videoTitles
      }
    });

  } catch (error) {
    console.error('❌ Error generating week PDF:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate PDF'
    });
  }
});

/**
 * POST /api/youtube/generate-curriculum-pdf
 * Generate complete curriculum PDF with all weeks
 */
router.post('/generate-curriculum-pdf', async (req, res) => {
  try {
    const { teachingPlan, weeklyVideos, generateNotes = false } = req.body;

    if (!teachingPlan || !teachingPlan.weeks) {
      return res.status(400).json({
        success: false,
        error: 'Invalid teaching plan format'
      });
    }

    console.log('📚 Generating complete curriculum PDF...');

    // Generate study notes for each week if requested
    const weeklyNotes = {};
    
    if (generateNotes && weeklyVideos) {
      for (const week of teachingPlan.weeks) {
        const weekKey = `week${week.week}`;
        const videos = weeklyVideos[weekKey]?.videos || [];
        
        if (videos.length > 0) {
          const notes = await youtubeService.generateStudyNotes(week, videos);
          weeklyNotes[week.week] = notes;
        }
      }
    }

    // Generate complete curriculum PDF
    const pdfResult = await pdfService.generateCurriculumPDF(
      teachingPlan,
      weeklyVideos || {},
      weeklyNotes
    );

    res.json({
      success: true,
      message: 'Complete curriculum PDF generated successfully',
      filename: pdfResult.filename,
      downloadUrl: `/api/youtube/download-pdf/${pdfResult.filename}`
    });

  } catch (error) {
    console.error('❌ Error generating curriculum PDF:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate curriculum PDF'
    });
  }
});

/**
 * GET /api/youtube/download-pdf/:filename
 * Download generated PDF file
 */
router.get('/download-pdf/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    
    // Security: Only allow PDF files and sanitize filename
    if (!filename.endsWith('.pdf') || filename.includes('..')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid filename'
      });
    }

    const filepath = path.join(__dirname, '../temp', filename);

    // Check if file exists
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        error: 'PDF file not found'
      });
    }

    // Send file for download
    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('❌ Error downloading PDF:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: 'Failed to download PDF'
          });
        }
      }
    });

  } catch (error) {
    console.error('❌ Error in download-pdf route:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to download PDF'
    });
  }
});

/**
 * POST /api/youtube/cleanup-pdfs
 * Manually trigger PDF cleanup (removes PDFs older than 1 hour)
 */
router.post('/cleanup-pdfs', (req, res) => {
  try {
    pdfService.cleanupOldPDFs();
    
    res.json({
      success: true,
      message: 'PDF cleanup completed'
    });

  } catch (error) {
    console.error('❌ Error cleaning up PDFs:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to cleanup PDFs'
    });
  }
});

// Schedule automatic cleanup every hour
setInterval(() => {
  pdfService.cleanupOldPDFs();
}, 60 * 60 * 1000); // 1 hour

export default router;
