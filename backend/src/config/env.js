const dotenv = require('dotenv');

dotenv.config({ quiet: true });

function positiveInteger(name, fallback) {
  const value = Number(process.env[name] || fallback);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return value;
}

const nodeEnv = process.env.NODE_ENV || 'development';
const developmentJwtSecret =
  'development-only-secret-change-before-deploying-0000000000000000';
const jwtAccessSecret = process.env.JWT_ACCESS_SECRET || developmentJwtSecret;

if (nodeEnv === 'production' && jwtAccessSecret.length < 32) {
  throw new Error(
    'JWT_ACCESS_SECRET must contain at least 32 characters in production.',
  );
}

const env = Object.freeze({
  nodeEnv,
  isProduction: nodeEnv === 'production',
  isTest: nodeEnv === 'test',
  port: positiveInteger('PORT', 4000),
  mongoUri:
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/coaching_management',
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  logLevel: process.env.LOG_LEVEL || 'info',
  rateLimitWindowMs: positiveInteger('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
  rateLimitMax: positiveInteger('RATE_LIMIT_MAX', 200),
  authRateLimitMax: positiveInteger('AUTH_RATE_LIMIT_MAX', 20),
  connectionTimeoutMs: positiveInteger('CONNECTION_TIMEOUT_MS', 5000),
  jwtAccessSecret,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshTokenTtlDays: positiveInteger('REFRESH_TOKEN_TTL_DAYS', 30),
  bcryptRounds: positiveInteger('BCRYPT_ROUNDS', 12),
  maxRefreshSessions: positiveInteger('MAX_REFRESH_SESSIONS', 5),
  objectStorageEndpoint: process.env.OBJECT_STORAGE_ENDPOINT,
  objectStorageRegion: process.env.OBJECT_STORAGE_REGION || 'auto',
  objectStorageBucket: process.env.OBJECT_STORAGE_BUCKET,
  objectStorageAccessKeyId: process.env.OBJECT_STORAGE_ACCESS_KEY_ID,
  objectStorageSecretAccessKey: process.env.OBJECT_STORAGE_SECRET_ACCESS_KEY,
  objectStoragePublicBaseUrl: process.env.OBJECT_STORAGE_PUBLIC_BASE_URL,
  objectStorageSignedUrlTtlSeconds: positiveInteger(
    'OBJECT_STORAGE_SIGNED_URL_TTL_SECONDS',
    300,
  ),
  seedAdminName: process.env.SEED_ADMIN_NAME,
  seedAdminEmail: process.env.SEED_ADMIN_EMAIL,
  seedAdminPassword: process.env.SEED_ADMIN_PASSWORD,
  seedAdminInstituteId: process.env.SEED_ADMIN_INSTITUTE_ID,
});

module.exports = env;
