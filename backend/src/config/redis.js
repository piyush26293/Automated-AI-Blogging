const redis = require('redis');
require('dotenv').config();

const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
});

client.on('error', (err) => {
  console.error('Redis Client Error', err);
});

client.on('connect', () => {
  console.log('Connected to Redis');
});

const connectRedis = async () => {
  if (!client.isOpen) {
    await client.connect();
  }
};

// Cache helper functions
const cacheHelpers = {
  get: async (key) => {
    try {
      await connectRedis();
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  },

  set: async (key, value, expiryInSeconds = 3600) => {
    try {
      await connectRedis();
      await client.setEx(key, expiryInSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  },

  del: async (key) => {
    try {
      await connectRedis();
      await client.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  },

  invalidatePattern: async (pattern) => {
    try {
      await connectRedis();
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Redis invalidatePattern error:', error);
      return false;
    }
  },
};

module.exports = {
  client,
  connectRedis,
  ...cacheHelpers,
};
