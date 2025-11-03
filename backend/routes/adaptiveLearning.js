import express from 'express';
import aiOrchestrator from '../services/aiOrchestrator.js';

const router = express.Router();

// Analyze student performance and generate recommendations for weak areas
// Called when student has areas scoring < 60%
router.post('/analyze-performance', async (req, res) => {
  try {
    const { quizResults, weakAreas, teachingPlan } = req.body;

    console.log('📊 Analyzing student performance...');
    console.log(`   Quiz results: ${quizResults.length}`);
    console.log(`   Weak areas: ${weakAreas.length}`);

    const prompt = `You are an AI tutor analyzing a student's quiz performance. The student has taken ${quizResults.length} quizzes and is struggling with ${weakAreas.length} topics.

QUIZ RESULTS:
${quizResults.map(r => `- Week ${r.week}: ${r.topics} - Score: ${r.percentage}% (${r.correctAnswers}/${r.total} correct)`).join('\n')}

WEAK AREAS (Scored < 60%):
${weakAreas.map(w => `- Week ${w.week}: ${w.topic} - Score: ${w.score}%`).join('\n')}

TEACHING PLAN CONTEXT:
${teachingPlan.map((week, i) => `Week ${week.week}: ${week.topics}\nActivities: ${week.activities}`).join('\n\n')}

Generate personalized learning recommendations for EACH weak area. For each recommendation:
1. Provide 3-4 specific, actionable activities the student should do
2. Suggest 2-3 resources or materials to review
3. Assign a priority level (high for scores <40%, medium for 40-50%, low for 50-60%)

Return ONLY a valid JSON object with this structure:
{
  "recommendations": [
    {
      "week": 1,
      "topic": "Topic name",
      "suggestedActivities": ["Activity 1", "Activity 2", "Activity 3"],
      "resources": ["Resource 1", "Resource 2"],
      "priority": "high"
    }
  ]
}`;

    const aiResponse = await aiOrchestrator.distributeTask('complex-questions', prompt);
    
    // Extract JSON from response
    let recommendations;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : aiResponse;
      recommendations = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      recommendations = { recommendations: [] };
    }

    console.log(`✅ Generated ${recommendations.recommendations?.length || 0} recommendations for weak areas`);

    res.json(recommendations);

  } catch (error) {
    console.error('❌ Error analyzing performance:', error);
    res.status(500).json({ 
      error: 'Failed to analyze performance',
      recommendations: []
    });
  }
});

// Generate advancement recommendations for students doing well
// Called when ALL quiz scores are >= 60%
router.post('/generate-recommendations', async (req, res) => {
  try {
    const { quizResults, teachingPlan } = req.body;

    console.log('🎯 Generating advancement recommendations...');
    console.log(`   Quiz results: ${quizResults.length}`);

    const prompt = `You are an AI tutor. The student is doing EXCELLENTLY - all quiz scores are 60% or higher!

QUIZ RESULTS:
${quizResults.map(r => `- Week ${r.week}: ${r.topics} - Score: ${r.percentage}% (${r.correctAnswers}/${r.total} correct)`).join('\n')}

TEACHING PLAN CONTEXT:
${teachingPlan.map((week, i) => `Week ${week.week}: ${week.topics}\nActivities: ${week.activities}`).join('\n\n')}

The student is ready for ADVANCED learning! Generate recommendations for:
1. Challenge activities to deepen understanding
2. Real-world applications to explore
3. Advanced topics to study next
4. Projects to build practical skills

Prioritize topics they scored highest on (those are their strengths).

Return ONLY a valid JSON object with this structure:
{
  "recommendations": [
    {
      "week": 1,
      "topic": "Advanced Topic name",
      "suggestedActivities": ["Challenge Activity 1", "Project idea", "Advanced exercise"],
      "resources": ["Advanced Resource 1", "Project guide"],
      "priority": "medium"
    }
  ]
}`;

    const aiResponse = await aiOrchestrator.distributeTask('complex-questions', prompt);
    
    // Extract JSON from response
    let recommendations;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : aiResponse;
      recommendations = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      recommendations = { recommendations: [] };
    }

    console.log(`✅ Generated ${recommendations.recommendations?.length || 0} advancement recommendations`);

    res.json(recommendations);

  } catch (error) {
    console.error('❌ Error generating recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to generate recommendations',
      recommendations: []
    });
  }
});

export default router;
