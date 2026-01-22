# AI Blog Platform - Zero-Touch Content Generation

A complete, production-ready AI-powered blogging platform that enables admins to generate unique, high-quality blog posts with a single click. Built with modern technologies and free AI APIs.

## 🌟 Features

- **Zero-Touch Content Generation**: Select a category and let AI generate complete blog posts
- **Dual AI Engine**: Primary Gemini API with HuggingFace fallback for reliability
- **AI Image Generation**: Automatic featured images via Stable Diffusion
- **Smart Caching**: Redis-powered caching for optimal performance
- **SEO Optimized**: Auto-generated meta tags, slugs, and Open Graph tags
- **Modern UI**: Next.js 14 with Tailwind CSS for blazing-fast, responsive design
- **Admin Dashboard**: Simple, intuitive interface with "Magic Button" content generation
- **Content Management**: Full CRUD operations for posts, categories, and media
- **JWT Authentication**: Secure admin portal with token refresh
- **Rate Limiting**: Built-in protection against API abuse
- **Database Triggers**: Automatic reading time, word count, and post count updates

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Architecture](#architecture)

## 🛠 Tech Stack

### Backend
- **Framework**: Node.js with Express.js
- **Database**: PostgreSQL 15 (with advanced triggers and indexes)
- **Cache**: Redis 7
- **AI Services**: 
  - Google Gemini API (primary)
  - HuggingFace Inference API (fallback)
- **Authentication**: JWT with refresh tokens
- **File Storage**: Local storage with optional Cloudinary integration

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with Typography plugin
- **Language**: TypeScript
- **Features**: ISR (Incremental Static Regeneration), SEO optimization

### DevOps
- **Containerization**: Docker & Docker Compose
- **Database Migration**: SQL scripts with versioning

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- PostgreSQL (v15 or higher)
- Redis (v7 or higher)
- Docker & Docker Compose (optional, for containerized setup)

### Required API Keys (Free Tiers Available)

1. **Google Gemini API Key**
   - Get it from: https://makersuite.google.com/app/apikey
   - Free tier includes generous usage limits

2. **HuggingFace API Token** (optional, for fallback)
   - Get it from: https://huggingface.co/settings/tokens
   - Free tier available for inference API

3. **Cloudinary Account** (optional, for cloud storage)
   - Get it from: https://cloudinary.com/users/register/free
   - Free tier includes 25GB storage

## 🚀 Installation

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/piyush26293/Automated-AI-Blogging.git
   cd Automated-AI-Blogging
   ```

2. **Configure environment variables**
   ```bash
   cp backend/.env.example backend/.env
   ```

3. **Edit backend/.env with your API keys**
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   HUGGINGFACE_API_KEY=your_huggingface_token_here
   JWT_SECRET=your_secure_random_string_min_32_chars
   JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
   ```

4. **Start the application**
   ```bash
   docker-compose up -d
   ```

5. **Initialize the database**
   ```bash
   docker exec -i ai-blog-postgres psql -U postgres -d ai_blog < database/migrations/001_initial_schema.sql
   docker exec -i ai-blog-postgres psql -U postgres -d ai_blog < database/seeds/categories.sql
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Admin Dashboard: http://localhost:3000/admin

### Option 2: Manual Installation

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the backend**
   ```bash
   npm run dev
   ```

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the frontend**
   ```bash
   npm run dev
   ```

#### Database Setup

1. **Create PostgreSQL database**
   ```bash
   psql -U postgres
   CREATE DATABASE ai_blog;
   \q
   ```

2. **Run migrations**
   ```bash
   psql -U postgres -d ai_blog -f database/migrations/001_initial_schema.sql
   ```

3. **Seed categories**
   ```bash
   psql -U postgres -d ai_blog -f database/seeds/categories.sql
   ```

## ⚙️ Configuration

### Backend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Backend server port | 5000 | No |
| `NODE_ENV` | Environment | development | No |
| `BASE_URL` | Backend URL | http://localhost:5000 | No |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 | No |
| `DB_HOST` | PostgreSQL host | localhost | Yes |
| `DB_PORT` | PostgreSQL port | 5432 | No |
| `DB_NAME` | Database name | ai_blog | Yes |
| `DB_USER` | Database user | postgres | Yes |
| `DB_PASSWORD` | Database password | - | Yes |
| `REDIS_HOST` | Redis host | localhost | Yes |
| `REDIS_PORT` | Redis port | 6379 | No |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | - | Yes |
| `JWT_REFRESH_SECRET` | Refresh token secret | - | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | - | Yes |
| `HUGGINGFACE_API_KEY` | HuggingFace token | - | No |
| `USE_LOCAL_STORAGE` | Use local file storage | true | No |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | - | No |
| `CLOUDINARY_API_KEY` | Cloudinary API key | - | No |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | - | No |

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | http://localhost:5000 |

## 🎯 Usage

### Creating Your First Admin User

1. **Register via API**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "admin",
       "email": "admin@example.com",
       "password": "secure_password"
     }'
   ```

2. **Login to Admin Dashboard**
   - Navigate to http://localhost:3000/admin/login
   - Enter your credentials
   - You'll be redirected to the dashboard

### Generating Blog Posts

1. **Access Admin Dashboard**
   - Login at http://localhost:3000/admin/login

2. **Use the Magic Button**
   - Select a category from the dropdown
   - Click "Generate Blog Post with AI"
   - Wait for the AI to generate content (30-60 seconds)
   - The post will automatically open in a new tab

3. **View Published Posts**
   - Visit http://localhost:3000
   - Browse all AI-generated posts

## 📚 API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

### Posts Endpoints

#### Get All Posts
```http
GET /api/posts?status=published&category=technology&page=1&limit=10
```

#### Get Single Post
```http
GET /api/posts/:slug
```

#### Generate Post (Protected)
```http
POST /api/posts/generate
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "category_id": "uuid",
  "topic": "Optional custom topic"
}
```

#### Check Generation Status (Protected)
```http
GET /api/posts/queue/:queueId
Authorization: Bearer <access_token>
```

### Categories Endpoints

#### Get All Categories
```http
GET /api/categories
```

#### Get Category by Slug
```http
GET /api/categories/slug/:slug
```

### Media Endpoints

#### Upload File (Protected)
```http
POST /api/media/upload
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

file: <binary_data>
```

#### Generate AI Image (Protected)
```http
POST /api/media/generate
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "topic": "Mountain landscape at sunset"
}
```

## 🏗 Architecture

### System Architecture

```
┌─────────────────┐
│   Next.js       │
│   Frontend      │
│   (Port 3000)   │
└────────┬────────┘
         │
         ├─────────────────────┐
         │                     │
┌────────▼────────┐   ┌───────▼────────┐
│   Express.js    │   │   PostgreSQL   │
│   Backend       │◄──┤   Database     │
│   (Port 5000)   │   │   (Port 5432)  │
└────────┬────────┘   └────────────────┘
         │
         ├─────────────────────┐
         │                     │
┌────────▼────────┐   ┌───────▼────────┐
│   Redis Cache   │   │   AI Services  │
│   (Port 6379)   │   │   - Gemini     │
└─────────────────┘   │   - HuggingFace│
                      └────────────────┘
```

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Google Gemini for powerful AI text generation
- HuggingFace for open-source AI models
- Next.js team for an amazing framework
- PostgreSQL community for a robust database
- Redis for lightning-fast caching

---

Built with ❤️ using free and open-source technologies