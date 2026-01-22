# Deployment Checklist

## Pre-Deployment

### Environment Setup
- [ ] Copy `backend/.env.example` to `backend/.env`
- [ ] Set `GEMINI_API_KEY` (required)
- [ ] Set `JWT_SECRET` (min 32 characters)
- [ ] Set `JWT_REFRESH_SECRET` (min 32 characters)
- [ ] Set `DB_PASSWORD` (if not using default)
- [ ] Set `HUGGINGFACE_API_KEY` (optional, for fallback)
- [ ] Set Cloudinary credentials (optional, for cloud storage)

### System Requirements
- [ ] Docker and Docker Compose installed
- [ ] Ports 3000, 5000, 5432, 6379 available
- [ ] Sufficient disk space (5GB+ recommended)
- [ ] Internet connectivity for AI APIs

## Docker Deployment

### Build and Start
```bash
# Quick start
chmod +x setup.sh
./setup.sh

# Or manual
docker-compose up -d
docker exec -i ai-blog-postgres psql -U postgres -d ai_blog < database/migrations/001_initial_schema.sql
docker exec -i ai-blog-postgres psql -U postgres -d ai_blog < database/seeds/categories.sql
```

### Verification Steps
- [ ] Check containers are running: `docker ps`
- [ ] Check backend health: `curl http://localhost:5000/health`
- [ ] Check frontend loads: Visit http://localhost:3000
- [ ] Check PostgreSQL: `docker exec ai-blog-postgres psql -U postgres -d ai_blog -c '\dt'`
- [ ] Check Redis: `docker exec ai-blog-redis redis-cli ping`

## Initial Setup

### Create Admin User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "your_secure_password"
  }'
```

### Test Login
- [ ] Navigate to http://localhost:3000/admin/login
- [ ] Login with created credentials
- [ ] Verify redirect to dashboard

### Test AI Generation
- [ ] Click on a category
- [ ] Click "Generate Blog Post with AI"
- [ ] Wait for generation (30-60 seconds)
- [ ] Verify post opens in new tab
- [ ] Check post appears on home page

## Production Deployment

### Security
- [ ] Change default database password
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable HTTPS/TLS
- [ ] Configure proper CORS origins
- [ ] Set up firewall rules
- [ ] Review rate limiting settings

### Environment Variables (Production)
- [ ] Set `NODE_ENV=production`
- [ ] Update `BASE_URL` to production URL
- [ ] Update `FRONTEND_URL` to production URL
- [ ] Configure proper database credentials
- [ ] Set up monitoring/logging

### Performance
- [ ] Configure Redis memory limits
- [ ] Set up database backups
- [ ] Monitor disk space
- [ ] Configure log rotation
- [ ] Set up health checks

### Monitoring
- [ ] Set up error logging
- [ ] Monitor API response times
- [ ] Track AI generation success rate
- [ ] Monitor Redis memory usage
- [ ] Monitor database connections

## Post-Deployment

### Functional Tests
- [ ] Test user registration
- [ ] Test login/logout
- [ ] Test post listing
- [ ] Test post detail page
- [ ] Test AI generation
- [ ] Test file upload (if using)
- [ ] Test category filtering
- [ ] Test pagination
- [ ] Test related posts
- [ ] Test error pages

### Performance Tests
- [ ] Check page load times
- [ ] Test with multiple simultaneous generations
- [ ] Verify caching is working
- [ ] Test rate limiting
- [ ] Check database query performance

### SEO Verification
- [ ] Verify meta tags on home page
- [ ] Verify meta tags on post pages
- [ ] Verify Open Graph tags
- [ ] Verify Twitter Cards
- [ ] Test with Google Lighthouse (target: 90+)

## Troubleshooting

### Common Issues

**Database connection failed:**
```bash
docker logs ai-blog-postgres
docker exec ai-blog-postgres pg_isready -U postgres
```

**Redis connection failed:**
```bash
docker logs ai-blog-redis
docker exec ai-blog-redis redis-cli ping
```

**Backend not starting:**
```bash
docker logs ai-blog-backend
# Check environment variables
docker exec ai-blog-backend env | grep -E "DB_|REDIS_|JWT_|GEMINI"
```

**Frontend not building:**
```bash
docker logs ai-blog-frontend
# Check API URL configuration
```

**AI generation failing:**
- Verify API keys are correct
- Check API quotas/limits
- Review backend logs for specific errors
- Test API keys separately

### Logs
```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Restart Services
```bash
# Restart specific service
docker-compose restart backend

# Restart all services
docker-compose restart

# Full rebuild
docker-compose down
docker-compose up -d --build
```

## Maintenance

### Regular Tasks
- [ ] Monitor disk space
- [ ] Review error logs weekly
- [ ] Check AI API usage/quotas
- [ ] Backup database regularly
- [ ] Update dependencies monthly
- [ ] Review security updates

### Database Backup
```bash
# Backup
docker exec ai-blog-postgres pg_dump -U postgres ai_blog > backup.sql

# Restore
cat backup.sql | docker exec -i ai-blog-postgres psql -U postgres ai_blog
```

### Updates
```bash
# Pull latest code
git pull

# Rebuild containers
docker-compose down
docker-compose up -d --build
```

## Support

- Documentation: README.md
- API Docs: API.md
- Project Summary: SUMMARY.md
- Issues: GitHub Issues

---

**Last Updated**: 2026-01-22
**Version**: 1.0.0
