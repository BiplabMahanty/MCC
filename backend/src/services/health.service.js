const mongoose = require('mongoose');

const env = require('../config/env');
const logger = require('../config/logger');
const { redisClient } = require('../config/redis');

async function withTimeout(operation, label) {
  let timeoutId;

  try {
    return await Promise.race([
      operation,
      new Promise((resolve, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error(`${label} health check timed out`)),
          env.connectionTimeoutMs,
        );
      }),
    ]);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function checkMongo() {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    return { status: 'disconnected' };
  }

  try {
    await withTimeout(mongoose.connection.db.admin().ping(), 'MongoDB');
    return { status: 'connected' };
  } catch (error) {
    logger.warn({ err: error }, 'MongoDB health check failed');
    return { status: 'disconnected' };
  }
}

async function checkRedis() {
  if (!redisClient.isReady) {
    return { status: 'disconnected' };
  }

  try {
    await withTimeout(redisClient.ping(), 'Redis');
    return { status: 'connected' };
  } catch (error) {
    logger.warn({ err: error }, 'Redis health check failed');
    return { status: 'disconnected' };
  }
}

async function getHealthStatus() {
  const [mongodb, redis] = await Promise.all([checkMongo(), checkRedis()]);
  const healthy =
    mongodb.status === 'connected' && redis.status === 'connected';

  return {
    status: healthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    services: {
      api: { status: 'connected' },
      mongodb,
      redis,
    },
  };
}

module.exports = {
  getHealthStatus,
};
