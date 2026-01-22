const db = require('../config/database');
const redis = require('../config/redis');
const aiService = require('../services/aiService');
const { generateUniqueSlug } = require('../utils/slugify');

const postController = {
  async getAll(req, res, next) {
    try {
      const { status, category, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      // Try cache first
      const cacheKey = `posts:${status || 'all'}:${category || 'all'}:${page}:${limit}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      let query = `
        SELECT p.*, c.name as category_name, c.slug as category_slug,
               u.username as author_name
        FROM posts p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN users u ON p.author_id = u.id
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 1;

      if (status) {
        query += ` AND p.status = $${paramCount}`;
        params.push(status);
        paramCount++;
      }

      if (category) {
        query += ` AND c.slug = $${paramCount}`;
        params.push(category);
        paramCount++;
      }

      query += ` ORDER BY p.published_at DESC, p.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      params.push(limit, offset);

      const result = await db.query(query, params);

      const countQuery = await db.query('SELECT COUNT(*) FROM posts WHERE 1=1');
      const total = parseInt(countQuery.rows[0].count);

      const response = {
        posts: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };

      await redis.set(cacheKey, response, 300); // Cache for 5 minutes

      res.json(response);
    } catch (error) {
      next(error);
    }
  },

  async getBySlug(req, res, next) {
    try {
      const { slug } = req.params;

      // Try cache first
      const cacheKey = `post:${slug}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        // Increment view count asynchronously
        db.query('UPDATE posts SET views = views + 1 WHERE slug = $1', [slug]);
        return res.json(cached);
      }

      const result = await db.query(
        `SELECT p.*, c.name as category_name, c.slug as category_slug,
                u.username as author_name
         FROM posts p
         LEFT JOIN categories c ON p.category_id = c.id
         LEFT JOIN users u ON p.author_id = u.id
         WHERE p.slug = $1`,
        [slug]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const post = result.rows[0];

      // Get tags
      const tagsResult = await db.query(
        `SELECT t.* FROM tags t
         JOIN post_tags pt ON t.id = pt.tag_id
         WHERE pt.post_id = $1`,
        [post.id]
      );
      post.tags = tagsResult.rows;

      await redis.set(cacheKey, { post }, 600); // Cache for 10 minutes

      // Increment view count
      await db.query('UPDATE posts SET views = views + 1 WHERE id = $1', [post.id]);

      res.json({ post });
    } catch (error) {
      next(error);
    }
  },

  async getRelatedPosts(req, res, next) {
    try {
      const { slug } = req.params;
      const limit = req.query.limit || 3;

      const postResult = await db.query('SELECT id, category_id FROM posts WHERE slug = $1', [slug]);
      
      if (postResult.rows.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const post = postResult.rows[0];

      const result = await db.query(
        `SELECT p.id, p.title, p.slug, p.excerpt, p.featured_image_url, p.published_at,
                c.name as category_name, c.slug as category_slug
         FROM posts p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.category_id = $1 AND p.id != $2 AND p.status = 'published'
         ORDER BY p.published_at DESC
         LIMIT $3`,
        [post.category_id, post.id, limit]
      );

      res.json({ relatedPosts: result.rows });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { title, content, excerpt, category_id, featured_image_url, status, meta_title, meta_description, meta_keywords } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }

      const slug = await generateUniqueSlug(title, async (slug) => {
        const result = await db.query('SELECT id FROM posts WHERE slug = $1', [slug]);
        return result.rows.length > 0;
      });

      const published_at = status === 'published' ? new Date() : null;

      const result = await db.query(
        `INSERT INTO posts (title, slug, content, excerpt, category_id, author_id, featured_image_url, status, meta_title, meta_description, meta_keywords, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [title, slug, content, excerpt, category_id, req.user.id, featured_image_url, status || 'draft', meta_title, meta_description, meta_keywords, published_at]
      );

      // Invalidate cache
      await redis.invalidatePattern('posts:*');

      res.status(201).json({ post: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async generatePost(req, res, next) {
    try {
      const { category_id, topic } = req.body;

      if (!category_id) {
        return res.status(400).json({ error: 'Category is required' });
      }

      // Get category details
      const categoryResult = await db.query('SELECT * FROM categories WHERE id = $1', [category_id]);
      if (categoryResult.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }
      const category = categoryResult.rows[0];

      // Generate topic if not provided
      let postTopic = topic;
      if (!postTopic) {
        const topics = await aiService.generateTopicSuggestions(category.name);
        postTopic = topics[0];
      }

      // Add to generation queue
      const queueResult = await db.query(
        'INSERT INTO generation_queue (category_id, requested_by, status) VALUES ($1, $2, $3) RETURNING id',
        [category_id, req.user.id, 'processing']
      );
      const queueId = queueResult.rows[0].id;

      // Start generation (async)
      setImmediate(async () => {
        try {
          await db.query('UPDATE generation_queue SET started_at = $1 WHERE id = $2', [new Date(), queueId]);

          // Generate content
          const content = await aiService.generateBlogPost(postTopic, category.ai_prompt_template, category.temperature);

          // Generate meta description
          const metaDescription = await aiService.generateMetaDescription(content);

          // Extract tags
          const tagNames = await aiService.extractTags(content);

          // Generate excerpt (first 200 chars)
          const excerpt = content.substring(0, 200).trim() + '...';

          // Create slug
          const slug = await generateUniqueSlug(postTopic, async (slug) => {
            const result = await db.query('SELECT id FROM posts WHERE slug = $1', [slug]);
            return result.rows.length > 0;
          });

          // Create post
          const postResult = await db.query(
            `INSERT INTO posts (title, slug, content, excerpt, category_id, author_id, status, meta_title, meta_description, published_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [postTopic, slug, content, excerpt, category_id, req.user.id, 'published', postTopic, metaDescription, new Date()]
          );
          const post = postResult.rows[0];

          // Create tags
          for (const tagName of tagNames) {
            const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-');
            let tagResult = await db.query('SELECT id FROM tags WHERE slug = $1', [tagSlug]);
            
            let tagId;
            if (tagResult.rows.length === 0) {
              const newTag = await db.query(
                'INSERT INTO tags (name, slug) VALUES ($1, $2) RETURNING id',
                [tagName, tagSlug]
              );
              tagId = newTag.rows[0].id;
            } else {
              tagId = tagResult.rows[0].id;
            }

            await db.query(
              'INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
              [post.id, tagId]
            );
          }

          // Update queue
          await db.query(
            'UPDATE generation_queue SET status = $1, completed_at = $2, generated_post_id = $3 WHERE id = $4',
            ['completed', new Date(), post.id, queueId]
          );

          // Invalidate cache
          await redis.invalidatePattern('posts:*');
        } catch (error) {
          console.error('Generation error:', error);
          await db.query(
            'UPDATE generation_queue SET status = $1, error_message = $2, completed_at = $3 WHERE id = $4',
            ['failed', error.message, new Date(), queueId]
          );
        }
      });

      res.status(202).json({
        message: 'Post generation started',
        queueId,
        topic: postTopic,
      });
    } catch (error) {
      next(error);
    }
  },

  async getGenerationStatus(req, res, next) {
    try {
      const { queueId } = req.params;

      const result = await db.query(
        `SELECT gq.*, p.slug as post_slug, p.title as post_title
         FROM generation_queue gq
         LEFT JOIN posts p ON gq.generated_post_id = p.id
         WHERE gq.id = $1`,
        [queueId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Queue item not found' });
      }

      res.json({ queue: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const allowedFields = ['title', 'content', 'excerpt', 'category_id', 'featured_image_url', 'status', 'meta_title', 'meta_description', 'meta_keywords'];
      const fields = Object.keys(updates).filter(key => allowedFields.includes(key));

      if (fields.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
      const values = fields.map(field => updates[field]);
      values.push(id);

      const result = await db.query(
        `UPDATE posts SET ${setClause} WHERE id = $${values.length} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Invalidate cache
      await redis.invalidatePattern('posts:*');
      await redis.del(`post:${result.rows[0].slug}`);

      res.json({ post: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const result = await db.query('DELETE FROM posts WHERE id = $1 RETURNING slug', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Invalidate cache
      await redis.invalidatePattern('posts:*');
      await redis.del(`post:${result.rows[0].slug}`);

      res.json({ message: 'Post deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = postController;
