const env = require('../config/env');
const Institute = require('../models/Institute');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const {
  createAccessToken,
  createRefreshToken,
  createRefreshTokenRecord,
  hashRefreshToken,
} = require('../utils/tokens');

async function publicUser(user) {
  const json = user.toJSON();
  const institute = await Institute.findById(user.instituteId).lean();
  json.instituteName = institute?.name ?? null;
  return json;
}

async function login({ email, password }) {
  const user = await User.findOne({
    email,
    isActive: true,
    isDeleted: false,
  }).select('+passwordHash +refreshTokens');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError(
      'Invalid email or password.',
      401,
      'INVALID_CREDENTIALS',
    );
  }

  const now = new Date();
  const refreshToken = createRefreshToken();
  const refreshTokenRecord = createRefreshTokenRecord(refreshToken, now);
  const unexpiredTokens = user.refreshTokens.filter(
    (token) => token.expiresAt > now,
  );
  const activeTokens =
    env.maxRefreshSessions > 1
      ? unexpiredTokens.slice(-(env.maxRefreshSessions - 1))
      : [];

  user.refreshTokens = [...activeTokens, refreshTokenRecord];
  user.lastLoginAt = now;
  await user.save();

  return {
    accessToken: createAccessToken(user),
    refreshToken,
    user: await publicUser(user),
  };
}

async function refreshSession(currentRefreshToken) {
  const now = new Date();
  const tokenHash = hashRefreshToken(currentRefreshToken);
  const nextRefreshToken = createRefreshToken();
  const nextTokenRecord = createRefreshTokenRecord(nextRefreshToken, now);

  const user = await User.findOneAndUpdate(
    {
      isDeleted: false,
      isActive: true,
      refreshTokens: {
        $elemMatch: {
          tokenHash,
          expiresAt: { $gt: now },
        },
      },
    },
    {
      $set: {
        'refreshTokens.$.tokenHash': nextTokenRecord.tokenHash,
        'refreshTokens.$.createdAt': nextTokenRecord.createdAt,
        'refreshTokens.$.expiresAt': nextTokenRecord.expiresAt,
      },
    },
    { new: true, runValidators: true },
  );

  if (!user) {
    throw new AppError(
      'Refresh token is invalid or expired.',
      401,
      'INVALID_REFRESH_TOKEN',
    );
  }

  return {
    accessToken: createAccessToken(user),
    refreshToken: nextRefreshToken,
    user: await publicUser(user),
  };
}

async function logout(refreshToken) {
  const tokenHash = hashRefreshToken(refreshToken);

  await User.updateOne(
    { 'refreshTokens.tokenHash': tokenHash },
    { $pull: { refreshTokens: { tokenHash } } },
  );
}

module.exports = {
  login,
  logout,
  refreshSession,
};
