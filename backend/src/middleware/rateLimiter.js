const { rateLimit } = require('express-rate-limit');

const env = require('../config/env');

const apiRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  limit: env.rateLimitMax,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: (req) => req.path === '/health',
  message: {
    status: 'error',
    message: 'Too many requests. Please try again later.',
  },
});

const loginRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  limit: env.authRateLimitMax,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    status: 'error',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    message: 'Too many sign-in attempts. Please try again later.',
  },
});

module.exports = apiRateLimiter;
module.exports.loginRateLimiter = loginRateLimiter;
