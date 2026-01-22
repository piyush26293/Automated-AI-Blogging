const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { client } = require('../config/redis');

const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  };

  // Use Redis store if available, otherwise use memory store
  if (client.isOpen) {
    defaultOptions.store = new RedisStore({
      client: client,
      prefix: 'rl:',
    });
  }

  return rateLimit({ ...defaultOptions, ...options });
};

// API rate limiter
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// Strict rate limiter for auth endpoints
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again later.',
});

// AI generation rate limiter (more restrictive)
const aiGenerationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many AI generation requests, please try again later.',
});

module.exports = {
  apiLimiter,
  authLimiter,
  aiGenerationLimiter,
};
