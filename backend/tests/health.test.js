process.env.NODE_ENV = 'test';

jest.mock('../src/services/health.service', () => ({
  getHealthStatus: jest.fn(),
}));

const request = require('supertest');

const app = require('../src/app');
const healthService = require('../src/services/health.service');

const healthyResponse = {
  status: 'healthy',
  timestamp: '2026-01-01T00:00:00.000Z',
  uptimeSeconds: 10,
  services: {
    api: { status: 'connected' },
    mongodb: { status: 'connected' },
    redis: { status: 'connected' },
  },
};

describe('GET /api/health', () => {
  test('returns 200 when MongoDB and Redis are connected', async () => {
    healthService.getHealthStatus.mockResolvedValue(healthyResponse);

    const response = await request(app).get('/api/health').expect(200);

    expect(response.body).toEqual(healthyResponse);
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-request-id']).toBeDefined();
  });

  test('returns 503 when a dependency is disconnected', async () => {
    healthService.getHealthStatus.mockResolvedValue({
      ...healthyResponse,
      status: 'degraded',
      services: {
        ...healthyResponse.services,
        redis: { status: 'disconnected' },
      },
    });

    const response = await request(app).get('/api/health').expect(503);

    expect(response.body.status).toBe('degraded');
    expect(response.body.services.redis.status).toBe('disconnected');
  });

  test('uses the global error handler when the health service throws', async () => {
    healthService.getHealthStatus.mockRejectedValue(
      new Error('Unexpected failure'),
    );

    const response = await request(app).get('/api/health').expect(500);

    expect(response.body).toEqual({
      status: 'error',
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  });
});

describe('unknown routes', () => {
  test('return the JSON 404 shape', async () => {
    const response = await request(app).get('/api/unknown').expect(404);

    expect(response.body).toEqual({
      status: 'error',
      code: 'ROUTE_NOT_FOUND',
      message: 'Route not found: GET /api/unknown',
    });
  });
});
