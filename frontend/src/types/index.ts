export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  post_count: number;
  ai_prompt_template?: string;
  temperature?: number;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category_id: string;
  category_name?: string;
  category_slug?: string;
  author_id: string;
  author_name?: string;
  featured_image_url?: string;
  status: 'draft' | 'published';
  views: number;
  reading_time_minutes: number;
  word_count: number;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Media {
  id: string;
  url: string;
  type: 'image' | 'video';
  filename: string;
  size: number;
  created_at: string;
}

export interface GenerationQueue {
  id: string;
  category_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  generated_post_id?: string;
  post_slug?: string;
  post_title?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
