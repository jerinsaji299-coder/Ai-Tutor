import { HfInference } from '@huggingface/inference';
import axios from 'axios';

class HuggingFaceService {
  constructor() {
    this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
    this.baseURL = 'https://api-inference.huggingface.co/models';
  }

  // Text Generation for Educational Content
  async generateEducationalContent(prompt, model = 'microsoft/DialoGPT-medium') {
    try {
      console.log(`🤗 HF: Generating content with ${model}...`);
      const response = await this.hf.textGeneration({
        model: model,
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
          do_sample: true,
        }
      });
      return response.generated_text;
    } catch (error) {
      console.error('HF Text Generation Error:', error);
      throw error;
    }
  }

  // Question Generation for Quizzes
  async generateQuestions(context, model = 'valhalla/t5-small-qa-qg-hl') {
    try {
      console.log(`🤗 HF: Generating questions with ${model}...`);
      
      // Try multiple approaches for question generation
      const approaches = [
        {
          model: 'valhalla/t5-small-qa-qg-hl',
          input: `generate questions: ${context}`
        },
        {
          model: 'microsoft/DialoGPT-medium',
          input: `Create 3 educational questions about: ${context}`
        }
      ];

      for (const approach of approaches) {
        try {
          const response = await this.hf.textGeneration({
            model: approach.model,
            inputs: approach.input,
            parameters: {
              max_new_tokens: 150,
              temperature: 0.8
            }
          });
          
          if (response && response.generated_text) {
            return this.parseQuestions(response.generated_text, context);
          }
        } catch (modelError) {
          console.warn(`Model ${approach.model} failed, trying next...`);
          continue;
        }
      }

      // Fallback: create basic questions
      return this.createFallbackQuestions(context);

    } catch (error) {
      console.error('HF Question Generation Error:', error);
      return this.createFallbackQuestions(context);
    }
  }

  // Text Summarization for Lesson Summaries
  async summarizeContent(text, model = 'facebook/bart-large-cnn') {
    try {
      console.log(`🤗 HF: Summarizing content with ${model}...`);
      
      // Truncate text if too long for the model
      const maxLength = 1024;
      const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
      
      const response = await this.hf.summarization({
        model: model,
        inputs: truncatedText,
        parameters: {
          max_length: 150,
          min_length: 50,
        }
      });
      
      return response[0]?.summary_text || `Summary of content about: ${text.substring(0, 100)}...`;
    } catch (error) {
      console.error('HF Summarization Error:', error);
      // Fallback summary
      return `Educational content summary: ${text.substring(0, 100)}...`;
    }
  }

  // Text Classification for Content Analysis
  async classifyContent(text, model = 'distilbert-base-uncased-finetuned-sst-2-english') {
    try {
      console.log(`🤗 HF: Classifying content with ${model}...`);
      const response = await this.hf.textClassification({
        model: model,
        inputs: text
      });
      return response;
    } catch (error) {
      console.error('HF Classification Error:', error);
      // Fallback classification
      return [
        { label: 'EDUCATIONAL', score: 0.95 },
        { label: 'APPROPRIATE', score: 0.90 }
      ];
    }
  }

  // Educational Content Translation
  async translateContent(text, targetLang = 'es', model = null) {
    try {
      // Select appropriate translation model
      const translationModels = {
        'es': 'Helsinki-NLP/opus-mt-en-es',
        'fr': 'Helsinki-NLP/opus-mt-en-fr',
        'de': 'Helsinki-NLP/opus-mt-en-de',
        'it': 'Helsinki-NLP/opus-mt-en-it',
        'pt': 'Helsinki-NLP/opus-mt-en-pt'
      };

      const selectedModel = model || translationModels[targetLang] || translationModels['es'];
      
      console.log(`🤗 HF: Translating to ${targetLang} with ${selectedModel}...`);
      
      const response = await this.hf.translation({
        model: selectedModel,
        inputs: text
      });
      
      return response[0]?.translation_text || text;
    } catch (error) {
      console.error('HF Translation Error:', error);
      return text; // Return original text if translation fails
    }
  }

  // Helper method to parse questions from AI response
  parseQuestions(response, context) {
    const questions = [];
    const lines = response.split('\n').filter(line => line.trim());
    
    // Try to extract questions from the response
    lines.forEach((line, index) => {
      if (line.includes('?') || line.toLowerCase().includes('question')) {
        questions.push({
          id: `hf-q-${index + 1}`,
          type: 'short-answer',
          question: line.trim(),
          correctAnswer: 'Answer based on understanding of the topic',
          explanation: `This question tests comprehension of: ${context.substring(0, 100)}...`,
          difficulty: 'Medium'
        });
      }
    });

    // If no questions found, create some
    if (questions.length === 0) {
      return this.createFallbackQuestions(context);
    }

    return questions.slice(0, 5); // Return max 5 questions
  }

  // Fallback question creation
  createFallbackQuestions(context) {
    const contextWords = context.split(' ').filter(word => word.length > 3).slice(0, 5);
    
    return contextWords.map((word, index) => ({
      id: `hf-fallback-${index + 1}`,
      type: index % 2 === 0 ? 'multiple-choice' : 'short-answer',
      question: `What is the significance of "${word}" in this educational context?`,
      options: index % 2 === 0 ? [
        `${word} is a fundamental concept`,
        `${word} is not relevant`,
        `${word} is optional knowledge`,
        `${word} is advanced material`
      ] : undefined,
      correctAnswer: index % 2 === 0 ? `${word} is a fundamental concept` : `${word} represents a key educational concept that students should understand.`,
      explanation: `Understanding ${word} is important for grasping the overall concepts in this educational material.`,
      difficulty: 'Medium'
    }));
  }

  // Fine-tuned Model Inference
  async useFineTunedModel(input, modelName) {
    try {
      console.log(`🤗 HF: Using fine-tuned model ${modelName}...`);
      const response = await axios.post(
        `${this.baseURL}/${modelName}`,
        { inputs: input },
        {
          headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Fine-tuned Model Error:', error);
      throw error;
    }
  }

  // Health check for HuggingFace service
  async healthCheck() {
    try {
      const testResponse = await this.hf.textGeneration({
        model: 'microsoft/DialoGPT-small',
        inputs: 'Hello',
        parameters: { max_new_tokens: 10 }
      });
      
      return {
        status: 'healthy',
        message: 'HuggingFace service is operational',
        testResponse: testResponse.generated_text
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'HuggingFace service is not available',
        error: error.message
      };
    }
  }
}

export default new HuggingFaceService();
