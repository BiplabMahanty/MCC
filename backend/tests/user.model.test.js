process.env.NODE_ENV = 'test';

const bcrypt = require('bcryptjs');

const User = require('../src/models/User');

function createUser(overrides = {}) {
  return new User({
    instituteId: '66f000000000000000000010',
    name: 'Teacher User',
    email: 'teacher@example.com',
    passwordHash: 'strong-password',
    role: 'teacher',
    refreshTokens: [
      {
        tokenHash: 'secret-hash',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 60_000),
      },
    ],
    ...overrides,
  });
}

describe('User model', () => {
  test('requires a valid email address', async () => {
    const user = createUser({ email: 'invalid-email' });

    await expect(user.validate()).rejects.toThrow();
  });

  test('never serializes password hashes, refresh tokens, or delete metadata', () => {
    const user = createUser({ isDeleted: false, deletedAt: null });
    const serialized = user.toJSON();

    expect(serialized.passwordHash).toBeUndefined();
    expect(serialized.refreshTokens).toBeUndefined();
    expect(serialized.isDeleted).toBeUndefined();
    expect(serialized.deletedAt).toBeUndefined();
  });

  test('compares a password against its bcrypt hash', async () => {
    const password = 'strong-password';
    const user = createUser({ passwordHash: await bcrypt.hash(password, 4) });

    await expect(user.comparePassword(password)).resolves.toBe(true);
    await expect(user.comparePassword('wrong-password')).resolves.toBe(false);
  });
});
