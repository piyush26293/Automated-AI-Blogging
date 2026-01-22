const db = require('../config/database');

const categoryController = {
  async getAll(req, res, next) {
    try {
      const result = await db.query(
        'SELECT * FROM categories ORDER BY name ASC'
      );

      res.json({ categories: result.rows });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const result = await db.query(
        'SELECT * FROM categories WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json({ category: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async getBySlug(req, res, next) {
    try {
      const { slug } = req.params;

      const result = await db.query(
        'SELECT * FROM categories WHERE slug = $1',
        [slug]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json({ category: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { name, slug, description, ai_prompt_template, temperature } = req.body;

      if (!name || !slug || !ai_prompt_template) {
        return res.status(400).json({ error: 'Name, slug, and AI prompt template are required' });
      }

      const result = await db.query(
        'INSERT INTO categories (name, slug, description, ai_prompt_template, temperature) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, slug, description, ai_prompt_template, temperature || 0.8]
      );

      res.status(201).json({ category: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, slug, description, ai_prompt_template, temperature } = req.body;

      const result = await db.query(
        'UPDATE categories SET name = COALESCE($1, name), slug = COALESCE($2, slug), description = COALESCE($3, description), ai_prompt_template = COALESCE($4, ai_prompt_template), temperature = COALESCE($5, temperature) WHERE id = $6 RETURNING *',
        [name, slug, description, ai_prompt_template, temperature, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json({ category: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const result = await db.query(
        'DELETE FROM categories WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = categoryController;
