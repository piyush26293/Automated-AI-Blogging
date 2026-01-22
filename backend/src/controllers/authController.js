const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { generateAccessToken, generateRefreshToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

const authController = {
  async register(req, res, next) {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await db.query(
        'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at',
        [username, email, hashedPassword, 'admin']
      );

      const user = result.rows[0];
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      await db.query(
        'UPDATE users SET refresh_token = $1 WHERE id = $2',
        [refreshToken, user.id]
      );

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      const result = await db.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = result.rows[0];
      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      await db.query(
        'UPDATE users SET refresh_token = $1 WHERE id = $2',
        [refreshToken, user.id]
      );

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  },

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token required' });
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      const result = await db.query(
        'SELECT * FROM users WHERE id = $1 AND refresh_token = $2',
        [decoded.id, refreshToken]
      );

      if (result.rows.length === 0) {
        return res.status(403).json({ error: 'Invalid refresh token' });
      }

      const user = result.rows[0];
      const newAccessToken = generateAccessToken(user);

      res.json({
        accessToken: newAccessToken,
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(403).json({ error: 'Refresh token expired' });
      }
      next(error);
    }
  },

  async logout(req, res, next) {
    try {
      await db.query(
        'UPDATE users SET refresh_token = NULL WHERE id = $1',
        [req.user.id]
      );

      res.json({ message: 'Logout successful' });
    } catch (error) {
      next(error);
    }
  },

  async getProfile(req, res, next) {
    try {
      const result = await db.query(
        'SELECT id, username, email, role, created_at FROM users WHERE id = $1',
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
