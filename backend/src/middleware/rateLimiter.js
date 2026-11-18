const { ipKeyGenerator, rateLimit } = require('express-rate-limit');

const env = require('../config/env');

const studentAttemptPath =
  /^\/student\/exams\/[^/]+\/attempt(?:\/answers|\/submit)?$/;

const apiRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  limit: env.rateLimitMax,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  // Exam answer syncs are authenticated and must not share one bucket
  // when students are behind the same school Wi-Fi/NAT IP.
  skip: (req) =>
    req.path === '/health' || studentAttemptPath.test(req.path),
  message: {
    status: 'error',
    message: 'Too many requests. Please try again later.',
  },
});

const examAttemptRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  limit: env.examRateLimitMax,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  // authenticate runs before these route-level handlers, so each student
  // gets an independent bucket instead of sharing the Wi-Fi IP bucket.
  keyGenerator: (req) =>
    req.user?._id
      ? `user:${req.user._id.toString()}`
      : `ip:${ipKeyGenerator(req.ip)}`,
  message: {
    status: 'error',
    code: 'EXAM_RATE_LIMIT_EXCEEDED',
    message: 'Too many exam requests. Please wait a moment and try again.',
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
module.exports.examAttemptRateLimiter = examAttemptRateLimiter;
