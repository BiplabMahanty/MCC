const { createClient } = require('redis');

const env = require('./env');
const logger = require('./logger');

const redisClient = createClient({
  url: env.redisUrl,
  socket: {
    connectTimeout: env.connectionTimeoutMs,
    reconnectStrategy: (retries) => {
      if (retries >= 5) {
        return new Error('Redis reconnect limit reached');
      }

      return Math.min(retries * 200, 2000);
    },
  },
});

redisClient.on('error', (error) => {
  logger.error({ err: error }, 'Redis client error');
});

redisClient.on('reconnecting', () => {
  logger.warn('Redis reconnecting');
});

async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    logger.info('Redis connected');
  }
}

async function disconnectRedis() {
  if (redisClient.isOpen) {
    await redisClient.close();
  }
}

module.exports = {
  connectRedis,
  disconnectRedis,
  redisClient,
};
