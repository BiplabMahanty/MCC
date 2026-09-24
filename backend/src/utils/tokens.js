const crypto = require('node:crypto');

const jwt = require('jsonwebtoken');

const env = require('../config/env');

function createAccessToken(user) {
  return jwt.sign(
    {
      role: user.role,
      instituteId: user.instituteId.toString(),
    },
    env.jwtAccessSecret,
    {
      expiresIn: env.jwtAccessExpiresIn,
      subject: user._id.toString(),
    },
  );
}

function createRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function createRefreshTokenRecord(token, now = new Date()) {
  const expiresAt = new Date(now);
  expiresAt.setUTCDate(expiresAt.getUTCDate() + env.refreshTokenTtlDays);

  return {
    tokenHash: hashRefreshToken(token),
    createdAt: now,
    expiresAt,
  };
}

module.exports = {
  createAccessToken,
  createRefreshToken,
  createRefreshTokenRecord,
  hashRefreshToken,
};
