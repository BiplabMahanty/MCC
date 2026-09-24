const express = require('express');

const authController = require('../controllers/auth.controller');
const authenticate = require('../middleware/authenticate');
const { loginRateLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const { loginSchema, refreshSchema } = require('../validators/auth.validators');

const router = express.Router();

router.post(
  '/login',
  loginRateLimiter,
  validate(loginSchema),
  asyncHandler(authController.login),
);
router.post(
  '/refresh',
  validate(refreshSchema),
  asyncHandler(authController.refresh),
);
router.post(
  '/logout',
  validate(refreshSchema),
  asyncHandler(authController.logout),
);
router.get('/me', authenticate, authController.me);

module.exports = router;
