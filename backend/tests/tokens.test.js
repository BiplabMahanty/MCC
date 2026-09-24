process.env.NODE_ENV = 'test';

const jwt = require('jsonwebtoken');

const env = require('../src/config/env');
const {
  createAccessToken,
  createRefreshToken,
  createRefreshTokenRecord,
  hashRefreshToken,
} = require('../src/utils/tokens');

describe('token utilities', () => {
  const user = {
    _id: '66f000000000000000000001',
    instituteId: '66f000000000000000000010',
    role: 'teacher',
  };

  test('creates a signed access token with role and institute claims', () => {
    const token = createAccessToken(user);
    const payload = jwt.verify(token, env.jwtAccessSecret);

    expect(payload).toEqual(
      expect.objectContaining({
        sub: user._id,
        role: 'teacher',
        instituteId: user.instituteId,
      }),
    );
  });

  test('creates a high-entropy opaque refresh token', () => {
    expect(createRefreshToken()).toMatch(/^[a-f0-9]{128}$/);
  });

  test('stores only the deterministic token hash with a UTC expiration date', () => {
    const token = 'refresh-token';
    const now = new Date('2026-09-24T00:00:00.000Z');
    const record = createRefreshTokenRecord(token, now);
    const expectedExpiration = new Date(now);
    expectedExpiration.setUTCDate(
      expectedExpiration.getUTCDate() + env.refreshTokenTtlDays,
    );

    expect(record.tokenHash).toBe(hashRefreshToken(token));
    expect(record.tokenHash).not.toContain(token);
    expect(record.createdAt).toBe(now);
    expect(record.expiresAt).toEqual(expectedExpiration);
  });
});
