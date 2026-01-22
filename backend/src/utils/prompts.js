const prompts = {
  generateTopicSuggestions: (category) => {
    return `Generate 5 unique and trending blog post topic ideas for the ${category} category. 
    Each topic should be:
    - Specific and engaging
    - Suitable for a 1500-word blog post
    - SEO-friendly
    - Current and relevant
    
    Return only the topic titles, numbered 1-5, without any additional explanation.`;
  },

  generateBlogPost: (topic, categoryPrompt) => {
    return categoryPrompt.replace('{topic}', topic);
  },

  generateImagePrompt: (topic) => {
    return `Create a professional, high-quality featured image for a blog post about "${topic}". 
    The image should be modern, clean, and visually appealing. 
    Style: professional blog header, vibrant colors, suitable for web publication.
    No text in the image.`;
  },

  extractTags: (content) => {
    return `Analyze the following blog post content and extract 5-8 relevant tags/keywords.
    Return only the tags, comma-separated, without any explanation.
    
    Content: ${content.substring(0, 1000)}...`;
  },

  generateMetaDescription: (content) => {
    return `Write a compelling meta description (150-160 characters) for this blog post that would work well for SEO.
    Return only the meta description without any additional text.
    
    Content: ${content.substring(0, 500)}...`;
  },
};

module.exports = prompts;
