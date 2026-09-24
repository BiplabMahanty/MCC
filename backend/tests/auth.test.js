process.env.NODE_ENV = 'test';

jest.mock('../src/services/auth.service', () => ({
  login: jest.fn(),
  logout: jest.fn(),
  refreshSession: jest.fn(),
}));

jest.mock('../src/models/User', () => ({
  findOne: jest.fn(),
}));

const jwt = require('jsonwebtoken');
const request = require('supertest');

const app = require('../src/app');
const env = require('../src/config/env');
const User = require('../src/models/User');
const authService = require('../src/services/auth.service');

const refreshToken = 'r'.repeat(128);
const user = {
  _id: '66f000000000000000000001',
  instituteId: '66f000000000000000000010',
  name: 'System Administrator',
  email: 'admin@example.com',
  role: 'admin',
};

const session = {
  accessToken: 'access-token',
  refreshToken,
  user,
};

describe('authentication routes', () => {
  test('POST /api/auth/login validates credentials and returns a session', async () => {
    authService.login.mockResolvedValue(session);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: ' ADMIN@example.com ', password: 'strong-password' })
      .expect(200);

    expect(authService.login).toHaveBeenCalledWith({
      email: 'admin@example.com',
      password: 'strong-password',
    });
    expect(response.body).toEqual(session);
  });

  test('POST /api/auth/login rejects malformed input', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: 'short' })
      .expect(400);

    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(response.body.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'email' })]),
    );
    expect(authService.login).not.toHaveBeenCalled();
  });

  test('POST /api/auth/refresh returns a rotated session', async () => {
    authService.refreshSession.mockResolvedValue({
      ...session,
      refreshToken: 'n'.repeat(128),
    });

    const response = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(authService.refreshSession).toHaveBeenCalledWith(refreshToken);
    expect(response.body.refreshToken).toBe('n'.repeat(128));
  });

  test('POST /api/auth/logout revokes the supplied refresh token', async () => {
    authService.logout.mockResolvedValue();

    await request(app)
      .post('/api/auth/logout')
      .send({ refreshToken })
      .expect(204);

    expect(authService.logout).toHaveBeenCalledWith(refreshToken);
  });

  test('GET /api/auth/me requires an access token', async () => {
    const response = await request(app).get('/api/auth/me').expect(401);

    expect(response.body.code).toBe('AUTHENTICATION_REQUIRED');
  });

  test('GET /api/auth/me returns the authenticated user', async () => {
    const accessToken = jwt.sign(
      { role: user.role, instituteId: user.instituteId },
      env.jwtAccessSecret,
      { subject: user._id, expiresIn: '5m' },
    );
    User.findOne.mockResolvedValue({ toJSON: () => user });

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(User.findOne).toHaveBeenCalledWith({
      _id: user._id,
      isActive: true,
      isDeleted: false,
    });
    expect(response.body).toEqual({ user });
  });
});
