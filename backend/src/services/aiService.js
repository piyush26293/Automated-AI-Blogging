const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const prompts = require('../utils/prompts');
require('dotenv').config();

class AIService {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.huggingfaceApiKey = process.env.HUGGINGFACE_API_KEY;
    
    if (this.geminiApiKey) {
      this.genAI = new GoogleGenerativeAI(this.geminiApiKey);
    }
  }

  async generateWithGemini(prompt, temperature = 0.8) {
    try {
      if (!this.geminiApiKey) {
        throw new Error('Gemini API key not configured');
      }

      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-pro',
        generationConfig: {
          temperature: temperature,
          maxOutputTokens: 2048,
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error.message);
      throw error;
    }
  }

  async generateWithHuggingFace(prompt, temperature = 0.8) {
    try {
      if (!this.huggingfaceApiKey) {
        throw new Error('HuggingFace API key not configured');
      }

      const response = await axios.post(
        'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
        {
          inputs: prompt,
          parameters: {
            temperature: temperature,
            max_new_tokens: 2048,
            return_full_text: false,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.huggingfaceApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }
      );

      return response.data[0]?.generated_text || response.data.generated_text;
    } catch (error) {
      console.error('HuggingFace API Error:', error.message);
      throw error;
    }
  }

  async generateText(prompt, temperature = 0.8) {
    // Try Gemini first, fallback to HuggingFace
    try {
      return await this.generateWithGemini(prompt, temperature);
    } catch (geminiError) {
      console.log('Gemini failed, trying HuggingFace fallback...');
      try {
        return await this.generateWithHuggingFace(prompt, temperature);
      } catch (hfError) {
        throw new Error('All AI services failed. Please check API keys and try again.');
      }
    }
  }

  async generateBlogPost(topic, categoryPrompt, temperature = 0.8) {
    const prompt = prompts.generateBlogPost(topic, categoryPrompt);
    return await this.generateText(prompt, temperature);
  }

  async generateTopicSuggestions(category) {
    const prompt = prompts.generateTopicSuggestions(category);
    const response = await this.generateText(prompt, 0.9);
    
    // Parse the numbered list with fallback handling
    let topics = response
      .split('\n')
      .filter(line => line.trim().match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim());
    
    // Fallback: if no numbered list found, try splitting by newlines
    if (topics.length === 0) {
      topics = response
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 10 && line.length < 200);
    }
    
    // Fallback: if still no topics, use the first sentence
    if (topics.length === 0 && response.length > 0) {
      topics = [response.split('.')[0].trim()];
    }
    
    return topics.slice(0, 5);
  }

  async extractTags(content) {
    const prompt = prompts.extractTags(content);
    const response = await this.generateText(prompt, 0.5);
    
    // Parse comma-separated tags
    const tags = response
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 8);
    
    return tags;
  }

  async generateMetaDescription(content) {
    const prompt = prompts.generateMetaDescription(content);
    const response = await this.generateText(prompt, 0.7);
    
    // Ensure it's within character limit
    return response.substring(0, 160).trim();
  }
}

module.exports = new AIService();
