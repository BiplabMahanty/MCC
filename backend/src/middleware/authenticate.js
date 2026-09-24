const jwt = require('jsonwebtoken');

const env = require('../config/env');
const User = require('../models/User');
const AppError = require('../utils/AppError');

async function authenticate(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(
      new AppError(
        'Authentication is required.',
        401,
        'AUTHENTICATION_REQUIRED',
      ),
    );
    return;
  }

  const token = authorization.slice('Bearer '.length).trim();

  try {
    const payload = jwt.verify(token, env.jwtAccessSecret);
    const user = await User.findOne({
      _id: payload.sub,
      isActive: true,
      isDeleted: false,
    });

    if (!user) {
      next(
        new AppError(
          'Authentication is required.',
          401,
          'AUTHENTICATION_REQUIRED',
        ),
      );
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    const code =
      error.name === 'TokenExpiredError'
        ? 'ACCESS_TOKEN_EXPIRED'
        : 'INVALID_ACCESS_TOKEN';
    next(new AppError('Access token is invalid or expired.', 401, code));
  }
}

module.exports = authenticate;
