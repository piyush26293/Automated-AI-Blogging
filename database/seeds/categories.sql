-- Default categories with AI-optimized prompts

INSERT INTO categories (name, slug, description, ai_prompt_template, temperature) VALUES
(
    'Technology',
    'technology',
    'Latest trends in technology, software development, and digital innovation',
    'Write a unique, SEO-friendly, plagiarism-free 1500-word blog post about {topic} in the technology domain. Use H2 and H3 headings for structure. Include an engaging introduction, detailed body sections with practical examples, bullet points for key takeaways, and a compelling conclusion. Write in a professional yet conversational tone. Focus on providing value to readers interested in technology trends and innovations.',
    0.8
),
(
    'Health & Wellness',
    'health-wellness',
    'Tips and insights on health, fitness, nutrition, and mental wellbeing',
    'Write a unique, SEO-friendly, plagiarism-free 1500-word blog post about {topic} in health and wellness. Use H2 and H3 headings to organize content. Start with an engaging introduction, include evidence-based information, practical tips, bullet points for action items, and a motivating conclusion. Write in an empathetic and encouraging tone. Focus on helping readers improve their health and wellbeing.',
    0.75
),
(
    'Travel',
    'travel',
    'Travel guides, destination tips, and adventure stories',
    'Write a unique, SEO-friendly, plagiarism-free 1500-word blog post about {topic} related to travel. Use H2 and H3 headings for structure. Include a captivating introduction, detailed destination information, insider tips, must-see attractions in bullet points, budget considerations, and an inspiring conclusion. Write in an enthusiastic and descriptive tone. Help readers plan their perfect trip.',
    0.85
),
(
    'Finance',
    'finance',
    'Personal finance, investing, and money management advice',
    'Write a unique, SEO-friendly, plagiarism-free 1500-word blog post about {topic} in personal finance. Use H2 and H3 headings for clarity. Include an informative introduction, detailed explanations with real-world examples, actionable strategies in bullet points, risk considerations, and a practical conclusion. Write in a trustworthy and educational tone. Focus on helping readers make informed financial decisions.',
    0.7
),
(
    'Food & Recipes',
    'food-recipes',
    'Delicious recipes, cooking tips, and culinary adventures',
    'Write a unique, SEO-friendly, plagiarism-free 1500-word blog post about {topic} related to food and cooking. Use H2 and H3 headings for organization. Include an appetizing introduction, ingredient lists in bullet points, step-by-step instructions, cooking tips and variations, nutritional information, and a delicious conclusion. Write in a warm and inviting tone. Make readers excited to try the recipe or cooking technique.',
    0.8
);
