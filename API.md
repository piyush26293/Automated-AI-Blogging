# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Authentication Endpoints

### POST /auth/register
Register a new admin user.

**Request Body:**
```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

---

### POST /auth/login
Login with credentials.

**Request Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

---

### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response (200):**
```json
{
  "accessToken": "new_jwt_token"
}
```

---

### POST /auth/logout
Logout current user (requires authentication).

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

### GET /auth/profile
Get current user profile (requires authentication).

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Posts Endpoints

### GET /posts
Get all posts with pagination and filtering.

**Query Parameters:**
- `status` (optional): Filter by status (published, draft)
- `category` (optional): Filter by category slug
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Response (200):**
```json
{
  "posts": [
    {
      "id": "uuid",
      "title": "Post Title",
      "slug": "post-title",
      "excerpt": "Post excerpt...",
      "content": "Full post content...",
      "category_id": "uuid",
      "category_name": "Technology",
      "category_slug": "technology",
      "author_name": "admin",
      "featured_image_url": "https://...",
      "status": "published",
      "views": 100,
      "reading_time_minutes": 5,
      "word_count": 1500,
      "published_at": "2024-01-01T00:00:00.000Z",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

---

### GET /posts/:slug
Get a single post by slug.

**Response (200):**
```json
{
  "post": {
    "id": "uuid",
    "title": "Post Title",
    "slug": "post-title",
    "content": "Full post content...",
    "excerpt": "Post excerpt...",
    "category_name": "Technology",
    "category_slug": "technology",
    "author_name": "admin",
    "featured_image_url": "https://...",
    "status": "published",
    "views": 101,
    "reading_time_minutes": 5,
    "word_count": 1500,
    "meta_title": "SEO Title",
    "meta_description": "SEO Description",
    "meta_keywords": "keyword1, keyword2",
    "published_at": "2024-01-01T00:00:00.000Z",
    "tags": [
      {
        "id": "uuid",
        "name": "AI",
        "slug": "ai"
      }
    ]
  }
}
```

---

### GET /posts/:slug/related
Get related posts for a specific post.

**Query Parameters:**
- `limit` (optional): Number of related posts (default: 3)

**Response (200):**
```json
{
  "relatedPosts": [
    {
      "id": "uuid",
      "title": "Related Post Title",
      "slug": "related-post",
      "excerpt": "Excerpt...",
      "featured_image_url": "https://...",
      "category_name": "Technology",
      "published_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### POST /posts (Protected)
Create a new post manually.

**Request Body:**
```json
{
  "title": "My Post Title",
  "content": "<p>Post content in HTML...</p>",
  "excerpt": "Short excerpt...",
  "category_id": "uuid",
  "featured_image_url": "https://...",
  "status": "published",
  "meta_title": "SEO Title",
  "meta_description": "SEO Description",
  "meta_keywords": "keyword1, keyword2"
}
```

**Response (201):**
```json
{
  "post": {
    "id": "uuid",
    "title": "My Post Title",
    "slug": "my-post-title",
    ...
  }
}
```

---

### POST /posts/generate (Protected, Rate Limited)
Generate a post using AI.

**Request Body:**
```json
{
  "category_id": "uuid",
  "topic": "Optional custom topic"
}
```

**Response (202):**
```json
{
  "message": "Post generation started",
  "queueId": "uuid",
  "topic": "The Future of AI"
}
```

---

### GET /posts/queue/:queueId (Protected)
Check the status of AI post generation.

**Response (200):**
```json
{
  "queue": {
    "id": "uuid",
    "category_id": "uuid",
    "status": "completed",
    "error_message": null,
    "generated_post_id": "uuid",
    "post_slug": "generated-post-slug",
    "post_title": "Generated Post Title",
    "started_at": "2024-01-01T00:00:00.000Z",
    "completed_at": "2024-01-01T00:01:00.000Z",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status values:**
- `pending`: Waiting to start
- `processing`: Currently generating
- `completed`: Successfully generated
- `failed`: Generation failed

---

### PUT /posts/:id (Protected)
Update an existing post.

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "content": "<p>Updated content...</p>",
  "status": "published"
}
```

**Response (200):**
```json
{
  "post": {
    "id": "uuid",
    ...updated fields
  }
}
```

---

### DELETE /posts/:id (Protected)
Delete a post.

**Response (200):**
```json
{
  "message": "Post deleted successfully"
}
```

---

## Categories Endpoints

### GET /categories
Get all categories.

**Response (200):**
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "Technology",
      "slug": "technology",
      "description": "Tech news and insights",
      "post_count": 10,
      "temperature": 0.8,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### GET /categories/:id
Get a category by ID.

**Response (200):**
```json
{
  "category": {
    "id": "uuid",
    "name": "Technology",
    "slug": "technology",
    "description": "Tech news and insights",
    "ai_prompt_template": "Write a blog post about {topic}...",
    "temperature": 0.8,
    "post_count": 10
  }
}
```

---

### GET /categories/slug/:slug
Get a category by slug.

**Response (200):**
```json
{
  "category": {
    "id": "uuid",
    "name": "Technology",
    "slug": "technology",
    ...
  }
}
```

---

### POST /categories (Protected)
Create a new category.

**Request Body:**
```json
{
  "name": "New Category",
  "slug": "new-category",
  "description": "Category description",
  "ai_prompt_template": "Write about {topic}...",
  "temperature": 0.8
}
```

**Response (201):**
```json
{
  "category": {
    "id": "uuid",
    ...
  }
}
```

---

### PUT /categories/:id (Protected)
Update a category.

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Response (200):**
```json
{
  "category": {
    "id": "uuid",
    ...updated fields
  }
}
```

---

### DELETE /categories/:id (Protected)
Delete a category.

**Response (200):**
```json
{
  "message": "Category deleted successfully"
}
```

---

## Media Endpoints

### GET /media
Get all media files.

**Query Parameters:**
- `type` (optional): Filter by type (image, video)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response (200):**
```json
{
  "media": [
    {
      "id": "uuid",
      "url": "https://...",
      "type": "image",
      "filename": "image.jpg",
      "size": 102400,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### POST /media/upload (Protected)
Upload a file.

**Request:**
- Content-Type: multipart/form-data
- Field name: `file`
- Allowed types: jpeg, jpg, png, gif, webp, mp4, webm
- Max size: 10MB

**Response (201):**
```json
{
  "media": {
    "id": "uuid",
    "url": "https://...",
    "type": "image",
    "filename": "image.jpg",
    "size": 102400
  }
}
```

---

### POST /media/generate (Protected, Rate Limited)
Generate an image using AI.

**Request Body:**
```json
{
  "topic": "Mountain landscape at sunset",
  "prompt": "Optional custom prompt"
}
```

**Response (201):**
```json
{
  "media": {
    "id": "uuid",
    "url": "https://...",
    "type": "image",
    "filename": "ai-generated-123456.png",
    "size": 204800
  }
}
```

---

### DELETE /media/:id (Protected)
Delete a media file.

**Response (200):**
```json
{
  "message": "Media deleted successfully"
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

**400 Bad Request:**
```json
{
  "error": "Validation error message"
}
```

**401 Unauthorized:**
```json
{
  "error": "Access token required"
}
```

**403 Forbidden:**
```json
{
  "error": "Admin access required"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**429 Too Many Requests:**
```json
{
  "error": "Too many requests, please try again later"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limits

- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **General API endpoints**: 100 requests per 15 minutes per IP
- **AI generation endpoints**: 10 requests per hour per IP

---

## Notes

1. All timestamps are in ISO 8601 format
2. UUIDs are used for all IDs
3. Pagination starts at page 1
4. Access tokens expire after 15 minutes
5. Refresh tokens expire after 7 days
6. AI generation is asynchronous - poll the queue endpoint for status
