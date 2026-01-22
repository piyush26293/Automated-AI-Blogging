#!/bin/bash

# AI Blog Platform - Quick Setup Script

echo "🚀 AI Blog Platform - Quick Setup"
echo "=================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend/.env from .env.example..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env and add your API keys:"
    echo "   - GEMINI_API_KEY"
    echo "   - HUGGINGFACE_API_KEY (optional)"
    echo "   - JWT_SECRET (generate a secure random string)"
    echo "   - JWT_REFRESH_SECRET (generate another secure random string)"
    echo ""
    echo "Press Enter to continue after editing the .env file..."
    read
fi

echo "🐳 Starting Docker containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

echo "📊 Initializing database..."
docker exec -i ai-blog-postgres psql -U postgres -d ai_blog < database/migrations/001_initial_schema.sql
docker exec -i ai-blog-postgres psql -U postgres -d ai_blog < database/seeds/categories.sql

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Access your application:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:5000"
echo "   - Admin Dashboard: http://localhost:3000/admin"
echo ""
echo "📝 Next steps:"
echo "   1. Create your admin account:"
echo "      curl -X POST http://localhost:5000/api/auth/register \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -d '{\"username\":\"admin\",\"email\":\"admin@example.com\",\"password\":\"secure_password\"}'"
echo ""
echo "   2. Login at http://localhost:3000/admin/login"
echo "   3. Start generating amazing content!"
echo ""
echo "🔍 To view logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 To stop the application:"
echo "   docker-compose down"
