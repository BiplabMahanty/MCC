process.env.NODE_ENV = 'test';

jest.mock('../src/models/User', () => ({
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  updateOne: jest.fn(),
}));

jest.mock('../src/utils/tokens', () => ({
  createAccessToken: jest.fn(() => 'access-token'),
  createRefreshToken: jest.fn(() => 'plain-refresh-token'),
  createRefreshTokenRecord: jest.fn(() => ({
    tokenHash: 'new-token-hash',
    createdAt: new Date('2026-09-24T00:00:00.000Z'),
    expiresAt: new Date('2026-10-24T00:00:00.000Z'),
  })),
  hashRefreshToken: jest.fn(() => 'current-token-hash'),
}));

const User = require('../src/models/User');
const authService = require('../src/services/auth.service');
const tokens = require('../src/utils/tokens');

function createUser(overrides = {}) {
  return {
    _id: '66f000000000000000000001',
    instituteId: '66f000000000000000000010',
    email: 'admin@example.com',
    name: 'Admin',
    role: 'admin',
    refreshTokens: [],
    comparePassword: jest.fn().mockResolvedValue(true),
    save: jest.fn().mockResolvedValue(),
    toJSON: jest.fn(() => ({
      _id: '66f000000000000000000001',
      email: 'admin@example.com',
      name: 'Admin',
      role: 'admin',
    })),
    ...overrides,
  };
}

describe('auth service', () => {
  test('login rejects unknown credentials with a generic error', async () => {
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    await expect(
      authService.login({
        email: 'missing@example.com',
        password: 'password123',
      }),
    ).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password.',
    });
  });

  test('login stores only a hashed refresh-token record', async () => {
    const user = createUser();
    const select = jest.fn().mockResolvedValue(user);
    User.findOne.mockReturnValue({ select });

    const session = await authService.login({
      email: user.email,
      password: 'password123',
    });

    expect(select).toHaveBeenCalledWith('+passwordHash +refreshTokens');
    expect(user.refreshTokens).toEqual([
      expect.objectContaining({ tokenHash: 'new-token-hash' }),
    ]);
    expect(user.refreshTokens).not.toContain('plain-refresh-token');
    expect(user.save).toHaveBeenCalledTimes(1);
    expect(session).toEqual(
      expect.objectContaining({
        accessToken: 'access-token',
        refreshToken: 'plain-refresh-token',
      }),
    );
  });

  test('refresh atomically replaces the matching unexpired token hash', async () => {
    const user = createUser();
    User.findOneAndUpdate.mockResolvedValue(user);

    const session = await authService.refreshSession('current-refresh-token');

    expect(tokens.hashRefreshToken).toHaveBeenCalledWith(
      'current-refresh-token',
    );
    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        isDeleted: false,
        refreshTokens: {
          $elemMatch: {
            tokenHash: 'current-token-hash',
            expiresAt: { $gt: expect.any(Date) },
          },
        },
      }),
      {
        $set: {
          'refreshTokens.$.tokenHash': 'new-token-hash',
          'refreshTokens.$.createdAt': expect.any(Date),
          'refreshTokens.$.expiresAt': expect.any(Date),
        },
      },
      { new: true, runValidators: true },
    );
    expect(session.refreshToken).toBe('plain-refresh-token');
  });

  test('refresh rejects a reused or expired token', async () => {
    User.findOneAndUpdate.mockResolvedValue(null);

    await expect(
      authService.refreshSession('invalid-refresh-token'),
    ).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_REFRESH_TOKEN',
    });
  });

  test('logout removes the matching token hash', async () => {
    User.updateOne.mockResolvedValue({ modifiedCount: 1 });

    await authService.logout('current-refresh-token');

    expect(User.updateOne).toHaveBeenCalledWith(
      { 'refreshTokens.tokenHash': 'current-token-hash' },
      { $pull: { refreshTokens: { tokenHash: 'current-token-hash' } } },
    );
  });
});
