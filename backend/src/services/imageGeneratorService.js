const axios = require('axios');
require('dotenv').config();

class ImageGeneratorService {
  constructor() {
    this.huggingfaceApiKey = process.env.HUGGINGFACE_API_KEY;
    this.model = 'stabilityai/stable-diffusion-2-1';
  }

  async generateImage(prompt) {
    try {
      if (!this.huggingfaceApiKey) {
        throw new Error('HuggingFace API key required for image generation');
      }

      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${this.model}`,
        { inputs: prompt },
        {
          headers: {
            'Authorization': `Bearer ${this.huggingfaceApiKey}`,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
          timeout: 60000,
        }
      );

      // Return image buffer
      return Buffer.from(response.data);
    } catch (error) {
      console.error('Image Generation Error:', error.message);
      
      // If HF model is loading, throw specific error
      if (error.response?.status === 503) {
        throw new Error('Image generation model is loading. Please try again in a moment.');
      }
      
      throw new Error('Failed to generate image');
    }
  }

  async generateBlogFeaturedImage(topic) {
    const prompt = `Professional blog header image for "${topic}", modern, clean, vibrant colors, high quality, no text`;
    return await this.generateImage(prompt);
  }
}

module.exports = new ImageGeneratorService();
