import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PDFService {
  constructor() {
    this.tempDir = path.join(__dirname, '../temp');
    this.ensureTempDir();
  }

  /**
   * Ensure temp directory exists
   */
  ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
      console.log('📁 Created temp directory for PDFs');
    }
  }

  /**
   * Generate comprehensive PDF notes for a specific week
   */
  async generateWeekPDF(weekData, videos, studyNotes) {
    try {
      console.log(`📄 Generating PDF for Week ${weekData.week}: ${weekData.topic}`);

      const filename = `week${weekData.week}_${weekData.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.pdf`;
      const filepath = path.join(this.tempDir, filename);

      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4'
      });
      
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // === COVER PAGE ===
      doc.fontSize(28)
         .fillColor('#2563eb')
         .text(`Week ${weekData.week}`, { align: 'center' });
      
      doc.fontSize(24)
         .fillColor('#1e40af')
         .text(weekData.topic, { align: 'center' });
      
      doc.moveDown(2);
      
      doc.fontSize(12)
         .fillColor('#6b7280')
         .text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
      
      doc.fontSize(10)
         .text('AI Tutor - Hybrid Learning Platform', { align: 'center' });

      // === CONTENT OVERVIEW ===
      doc.addPage();
      doc.fontSize(20)
         .fillColor('#2563eb')
         .text('📚 Overview', { underline: true });
      
      doc.moveDown();
      doc.fontSize(12)
         .fillColor('#000')
         .text(weekData.content || 'Comprehensive study of key concepts and practical applications.', {
           align: 'justify',
           lineGap: 5
         });

      // === LEARNING OBJECTIVES ===
      if (weekData.learning_objectives && weekData.learning_objectives.length > 0) {
        doc.moveDown(2);
        doc.fontSize(18)
           .fillColor('#2563eb')
           .text('🎯 Learning Objectives');
        
        doc.moveDown(0.5);
        weekData.learning_objectives.forEach((objective, index) => {
          doc.fontSize(11)
             .fillColor('#000')
             .text(`${index + 1}. ${objective}`, { indent: 20, lineGap: 3 });
        });
      }

      // === STUDY NOTES (AI GENERATED FROM VIDEO TRANSCRIPTS) ===
      doc.addPage();
      doc.fontSize(20)
         .fillColor('#2563eb')
         .text('📝 Study Notes', { underline: true });
      
      doc.moveDown(0.5);

      // Indicate if notes are based on video transcripts
      if (studyNotes.basedOnTranscripts) {
        doc.fontSize(10)
           .fillColor('#059669')
           .text(`✅ Generated from ${studyNotes.transcriptCount} video transcript(s)`, { 
             align: 'center',
             color: 'green'
           });
        doc.moveDown(0.5);
      }
      
      doc.moveDown();
      
      // Parse and format the AI-generated notes
      const notesText = studyNotes.generatedNotes || 'Comprehensive study notes covering key concepts.';
      const notesSections = notesText.split('\n\n');
      
      notesSections.forEach(section => {
        if (section.trim()) {
          // Check if section has emoji header (like 📘 INTRODUCTION)
          if (section.match(/^[📘🎯📖💡⚠️✅📋]/)) {
            doc.fontSize(14)
               .fillColor('#1e40af')
               .text(section.trim(), { lineGap: 5 });
          } else {
            doc.fontSize(11)
               .fillColor('#000')
               .text(section.trim(), { lineGap: 4, align: 'justify' });
          }
          doc.moveDown(0.5);
        }
      });

      // === VIDEO RESOURCES ===
      if (videos && videos.length > 0) {
        doc.addPage();
        doc.fontSize(20)
           .fillColor('#2563eb')
           .text('🎥 Video Resources', { underline: true });
        
        doc.moveDown();

        videos.forEach((video, index) => {
          // Video title
          doc.fontSize(14)
             .fillColor('#1e40af')
             .text(`${index + 1}. ${video.title}`, { bold: true });
          
          // Channel and duration
          doc.fontSize(10)
             .fillColor('#6b7280')
             .text(`Duration: ${video.duration}`, { indent: 15 });
          
          // URL
          doc.fontSize(10)
             .fillColor('#2563eb')
             .text(video.isSearchLink ? 'Click to search on YouTube' : 'Watch Video', { 
               indent: 15,
               link: video.url,
               underline: true 
             });
          
          doc.fontSize(9)
             .fillColor('#3b82f6')
             .text(video.url, { indent: 15, continued: false });
          
          // AI Summary
          doc.fontSize(11)
             .fillColor('#374151')
             .text(`Summary: ${video.summary}`, { 
               indent: 15,
               lineGap: 3,
               align: 'justify'
             });
          
          doc.moveDown();
        });
      }

      // === ACTIVITIES ===
      if (weekData.activities && weekData.activities.length > 0) {
        doc.addPage();
        doc.fontSize(18)
           .fillColor('#2563eb')
           .text('💪 Practice Activities');
        
        doc.moveDown();
        weekData.activities.forEach((activity, index) => {
          doc.fontSize(11)
             .fillColor('#000')
             .text(`${index + 1}. ${activity}`, { indent: 20, lineGap: 3 });
        });
      }

      // === FOOTER ===
      doc.fontSize(8)
         .fillColor('#9ca3af')
         .text('\n\nGenerated by AI Tutor - Empowering Education with AI', {
           align: 'center'
         });

      doc.end();

      // Wait for PDF generation to complete
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });

      console.log(`✅ PDF generated: ${filename}`);
      return { filename, filepath };

    } catch (error) {
      console.error('❌ Error generating week PDF:', error);
      throw error;
    }
  }

  /**
   * Generate complete curriculum PDF with all weeks
   */
  async generateCurriculumPDF(teachingPlan, weeklyVideos, weeklyNotes) {
    try {
      console.log('📚 Generating complete curriculum PDF...');

      const filename = `curriculum_${teachingPlan.subject.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
      const filepath = path.join(this.tempDir, filename);
      
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // === COVER PAGE ===
      doc.fontSize(32)
         .fillColor('#2563eb')
         .text(teachingPlan.subject, { align: 'center' });
      
      doc.moveDown();
      doc.fontSize(20)
         .fillColor('#1e40af')
         .text(`Grade ${teachingPlan.grade || teachingPlan.gradeLevel}`, { align: 'center' });
      
      doc.moveDown();
      doc.fontSize(16)
         .fillColor('#6b7280')
         .text(`${teachingPlan.duration} Week Curriculum`, { align: 'center' });
      
      doc.moveDown(2);
      doc.fontSize(12)
         .text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });

      // === TABLE OF CONTENTS ===
      doc.addPage();
      doc.fontSize(24)
         .fillColor('#2563eb')
         .text('📑 Table of Contents', { underline: true });
      
      doc.moveDown();

      teachingPlan.weeks.forEach((week, index) => {
        doc.fontSize(12)
           .fillColor('#000')
           .text(`Week ${week.week}: ${week.topic}`, { indent: 20 });
      });

      // === WEEKLY CONTENT ===
      for (const week of teachingPlan.weeks) {
        doc.addPage();
        
        const videos = weeklyVideos[`week${week.week}`]?.videos || [];
        const notes = weeklyNotes[week.week];
        
        // Week header
        doc.fontSize(24)
           .fillColor('#2563eb')
           .text(`Week ${week.week}`, { underline: true });
        
        doc.fontSize(20)
           .fillColor('#1e40af')
           .text(week.topic);
        
        doc.moveDown();

        // Week description
        doc.fontSize(12)
           .fillColor('#000')
           .text(week.content || 'Comprehensive coverage of key concepts.', { 
             align: 'justify',
             lineGap: 4
           });
        
        doc.moveDown();

        // Learning objectives (condensed for full curriculum)
        if (week.learning_objectives && week.learning_objectives.length > 0) {
          doc.fontSize(14)
             .fillColor('#2563eb')
             .text('🎯 Learning Objectives:');
          
          week.learning_objectives.slice(0, 3).forEach(obj => {
            doc.fontSize(10)
               .fillColor('#000')
               .text(`• ${obj}`, { indent: 20 });
          });
          
          doc.moveDown();
        }

        // Video resources for this week (condensed)
        if (videos.length > 0) {
          doc.fontSize(14)
             .fillColor('#2563eb')
             .text('🎥 Video Resources:');
          
          doc.moveDown(0.5);

          videos.forEach((video, index) => {
            doc.fontSize(11)
               .fillColor('#1e40af')
               .text(`${index + 1}. ${video.title}`);
            
            doc.fontSize(9)
               .fillColor('#3b82f6')
               .text(video.url, { link: video.url, underline: true, indent: 15 });
            
            doc.moveDown(0.3);
          });
        }

        doc.moveDown();
      }

      // === FOOTER ===
      doc.addPage();
      doc.fontSize(20)
         .fillColor('#2563eb')
         .text('🎓 Continue Your Learning Journey', { align: 'center' });
      
      doc.moveDown();
      doc.fontSize(12)
         .fillColor('#6b7280')
         .text('Generated by AI Tutor - Hybrid AI Learning Platform', { align: 'center' });

      doc.end();

      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });

      console.log(`✅ Complete curriculum PDF generated: ${filename}`);
      return { filename, filepath };

    } catch (error) {
      console.error('❌ Error generating curriculum PDF:', error);
      throw error;
    }
  }

  /**
   * Clean up old PDF files (older than 1 hour)
   */
  cleanupOldPDFs() {
    try {
      const files = fs.readdirSync(this.tempDir);
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;

      files.forEach(file => {
        const filepath = path.join(this.tempDir, file);
        const stats = fs.statSync(filepath);
        
        if (now - stats.mtimeMs > oneHour) {
          fs.unlinkSync(filepath);
          console.log(`🗑️ Cleaned up old PDF: ${file}`);
        }
      });
    } catch (error) {
      console.error('❌ Error cleaning up PDFs:', error);
    }
  }
}

export default new PDFService();
