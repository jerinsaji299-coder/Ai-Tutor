const Anthropic = require('@anthropic-ai/sdk');
require('tailwindcss')
require('@tailwindcss/postcss')

class ClaudeClient {
  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is required');
    }
    
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async generateTeachingPlan(syllabusData) {
    const { syllabus, subject, grade, duration } = syllabusData;
    
    const prompt = `You are an expert educational AI assistant helping teachers create comprehensive semester plans.

Please analyze the following syllabus and generate a structured JSON response for a ${duration}-week ${subject} course for grade ${grade}:

SYLLABUS:
${syllabus}

Generate a JSON response with the following structure:
{
  "semester_plan": [
    {
      "week": 1,
      "topics": "Specific topic for this week",
      "activities": "Detailed learning activities and teaching methods"
    }
  ],
  "lesson_aids": [
    "List of specific teaching aids, resources, and materials"
  ],
  "assessments": [
    "List of assessments with timing and type"
  ]
}

Requirements:
1. Create detailed week-by-week breakdown for all ${duration} weeks
2. Include diverse, engaging activities for each week
3. Suggest practical lesson aids (PPT topics, videos, worksheets, hands-on activities)
4. Plan assessments strategically throughout the semester
5. Ensure content is appropriate for grade ${grade}
6. Make activities progressive and build upon previous weeks

Return ONLY the JSON object, no additional text.`;

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const jsonResponse = response.content[0].text.trim();
      
      // Try to parse the JSON response
      try {
        return JSON.parse(jsonResponse);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        // Fallback response if JSON parsing fails
        return this.getFallbackResponse(syllabusData);
      }
    } catch (error) {
      console.error('Claude API Error:', error);
      throw new Error('Failed to generate teaching plan');
    }
  }

  getFallbackResponse(syllabusData) {
    const { duration, subject, grade } = syllabusData;
    
    return {
      semester_plan: Array.from({ length: parseInt(duration) }, (_, i) => ({
        week: i + 1,
        topics: `${subject} Topic for Week ${i + 1}`,
        activities: `Learning activities and assignments for week ${i + 1}`
      })),
      lesson_aids: [
        `PPT: ${subject} Fundamentals`,
        `Video Resources for Grade ${grade}`,
        `Interactive Worksheets`,
        `Hands-on Projects`
      ],
      assessments: [
        `Quiz 1 (Week ${Math.ceil(duration/4)})`,
        `Midterm Exam (Week ${Math.ceil(duration/2)})`,
        `Project Assignment (Week ${Math.ceil(duration*3/4)})`,
        `Final Exam (Week ${duration})`
      ]
    };
  }
}

module.exports = ClaudeClient;

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}