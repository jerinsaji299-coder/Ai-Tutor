import express from 'express';

const router = express.Router();

/**
 * Generate AI-powered study notes for a specific week
 */
router.post('/generate', async (req, res) => {
  try {
    const { weekNumber, topic, activities, learningObjectives, subject, grade } = req.body;

    console.log(`📝 Generating study notes for Week ${weekNumber}: ${topic}`);
    console.log('📋 Request body:', { weekNumber, topic, activities, subject, grade });

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not found in environment variables');
      return res.status(500).json({ 
        error: 'API key not configured',
        message: 'GEMINI_API_KEY is missing' 
      });
    }
    
    console.log('✅ API Key loaded, length:', apiKey.length);

    const prompt = `You are an expert educational content creator. Generate comprehensive study notes for students.

SUBJECT: ${subject}
GRADE LEVEL: ${grade}
WEEK: ${weekNumber}
TOPIC: ${topic}

LEARNING OBJECTIVES:
${Array.isArray(learningObjectives) ? learningObjectives.join('\n') : learningObjectives}

ACTIVITIES COVERED:
${activities}

Generate well-structured study notes in the following format:

## 📚 KEY CONCEPTS
(List 5-7 main concepts the student must understand)

## 📖 DEFINITIONS
(Define important terms and vocabulary)

## 💡 EXAMPLES
(Provide 2-3 clear examples with explanations)

## ✏️ PRACTICE TIPS
(Give 3-5 actionable study tips)

## 🎯 QUICK REVISION POINTS
(Bullet points for last-minute revision - 5-7 points)

## 📝 SUMMARY
(2-3 sentence overview of the entire topic)

Make it clear, concise, and student-friendly. Use emojis for visual appeal. Format using markdown.`;

    console.log('🌐 Making request to Gemini API...');

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    console.log('📡 Gemini API response status:', response.status);
    
    const geminiData = await response.json();
    console.log('📊 Gemini API response received');
    
    if (!response.ok || geminiData.error) {
      const errorMessage = geminiData.error?.message || 'Unknown API error';
      console.error('❌ Gemini API Error:', response.status, errorMessage);
      console.error('📄 Full error:', JSON.stringify(geminiData, null, 2));
      return res.status(500).json({ 
        error: 'Failed to generate study notes',
        message: errorMessage,
        details: geminiData.error
      });
    }

    const responseText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!responseText) {
      console.error('❌ Empty response from Gemini API');
      return res.status(500).json({ 
        error: 'Empty response from AI',
        message: 'No text content received from Gemini'
      });
    }

    console.log('✅ Study notes generated successfully, length:', responseText.length);

    res.json({
      notes: responseText,
      weekNumber,
      topic,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error generating study notes:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to generate study notes',
      message: error.message 
    });
  }
});

/**
 * Generate summary notes for entire semester
 */
router.post('/generate-semester-summary', async (req, res) => {
  try {
    const { semesterPlan, subject, grade } = req.body;

    console.log(`📚 Generating semester summary for ${subject} Grade ${grade}`);

    const apiKey = process.env.GEMINI_API_KEY;

    const weeksContent = semesterPlan.map(week => 
      `Week ${week.week}: ${week.topics}\n${week.activities}`
    ).join('\n\n');

    const prompt = `Create a comprehensive semester review guide for students.

SUBJECT: ${subject}
GRADE LEVEL: ${grade}

SEMESTER CONTENT:
${weeksContent}

Generate a semester summary that includes:

## 📚 SEMESTER OVERVIEW
(Brief introduction to what was covered)

## 🎯 MAIN TOPICS
(List all major topics covered across all weeks)

## 💡 KEY TAKEAWAYS
(10-15 most important points from the entire semester)

## 📖 IMPORTANT FORMULAS/CONCEPTS
(List crucial formulas, definitions, or concepts)

## ✅ FINAL EXAM PREPARATION CHECKLIST
(What students should review before the final exam)

## 🔗 TOPIC CONNECTIONS
(How different weeks' topics connect to each other)

Make it comprehensive yet concise. Use markdown formatting with emojis.`;

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    const geminiData = await response.json();
    
    if (!response.ok || geminiData.error) {
      const errorMessage = geminiData.error?.message || 'Unknown API error';
      console.error('❌ Gemini API Error:', errorMessage);
      throw new Error(errorMessage);
    }

    const responseText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    console.log('✅ Semester summary generated successfully');

    res.json({
      summary: responseText,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error generating semester summary:', error);
    res.status(500).json({ 
      error: 'Failed to generate semester summary',
      message: error.message 
    });
  }
});

export default router;
