process.env.NODE_ENV = 'test';

const serviceNames = ['students', 'teachers', 'courses', 'batches', 'subjects'];

serviceNames.forEach((name) => {
  jest.mock(`../src/services/admin/${name}.service`, () => ({
    create: jest.fn(),
    getById: jest.fn(),
    list: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
  }));
});

jest.mock('../src/services/admin/dashboard.service', () => ({
  getDashboard: jest.fn(),
}));

jest.mock('../src/models/User', () => ({
  findOne: jest.fn(),
}));

const jwt = require('jsonwebtoken');
const request = require('supertest');

const app = require('../src/app');
const env = require('../src/config/env');
const User = require('../src/models/User');
const coursesService = require('../src/services/admin/courses.service');
const dashboardService = require('../src/services/admin/dashboard.service');
const studentsService = require('../src/services/admin/students.service');

const instituteId = '66f000000000000000000010';
const adminId = '66f000000000000000000001';

function accessToken(role = 'admin') {
  return jwt.sign({ role, instituteId }, env.jwtAccessSecret, {
    subject: adminId,
    expiresIn: '5m',
  });
}

function authenticateAs(role = 'admin') {
  User.findOne.mockResolvedValue({
    _id: adminId,
    instituteId,
    role,
  });
}

describe('admin routes', () => {
  test('reject unauthenticated requests', async () => {
    const response = await request(app).get('/api/admin/dashboard').expect(401);
    expect(response.body.code).toBe('AUTHENTICATION_REQUIRED');
  });

  test('rejects authenticated non-admin users', async () => {
    authenticateAs('student');

    const response = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${accessToken('student')}`)
      .expect(403);

    expect(response.body.code).toBe('FORBIDDEN');
    expect(dashboardService.getDashboard).not.toHaveBeenCalled();
  });

  test('returns institute-scoped dashboard counts', async () => {
    authenticateAs();
    const counts = {
      students: 10,
      teachers: 3,
      batches: 2,
      courses: 1,
      subjects: 5,
    };
    dashboardService.getDashboard.mockResolvedValue(counts);

    const response = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${accessToken()}`)
      .expect(200);

    expect(dashboardService.getDashboard).toHaveBeenCalledWith(instituteId);
    expect(response.body).toEqual({ data: counts });
  });

  test('parses pagination and filters for student lists', async () => {
    authenticateAs();
    studentsService.list.mockResolvedValue({
      data: [],
      pagination: { page: 2, limit: 10, total: 0, totalPages: 0 },
    });

    await request(app)
      .get('/api/admin/students?page=2&limit=10&search=ann&isActive=true')
      .set('Authorization', `Bearer ${accessToken()}`)
      .expect(200);

    expect(studentsService.list).toHaveBeenCalledWith(instituteId, {
      page: 2,
      limit: 10,
      search: 'ann',
      isActive: true,
    });
  });

  test('validates and normalizes course creation', async () => {
    authenticateAs();
    coursesService.create.mockImplementation(async (tenant, input) => ({
      _id: '66f000000000000000000020',
      instituteId: tenant,
      ...input,
    }));

    const response = await request(app)
      .post('/api/admin/courses')
      .set('Authorization', `Bearer ${accessToken()}`)
      .send({ name: 'Science', code: ' sci ', description: 'Core course' })
      .expect(201);

    expect(coursesService.create).toHaveBeenCalledWith(instituteId, {
      name: 'Science',
      code: 'SCI',
      description: 'Core course',
      isActive: true,
    });
    expect(response.body.data.code).toBe('SCI');
  });

  test('does not accept a client-supplied institute identifier', async () => {
    authenticateAs();

    const response = await request(app)
      .post('/api/admin/courses')
      .set('Authorization', `Bearer ${accessToken()}`)
      .send({
        name: 'Science',
        code: 'SCI',
        instituteId: '66f000000000000000000099',
      })
      .expect(400);

    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(coursesService.create).not.toHaveBeenCalled();
  });

  test('validates required student account fields', async () => {
    authenticateAs();

    const response = await request(app)
      .post('/api/admin/students')
      .set('Authorization', `Bearer ${accessToken()}`)
      .send({ name: 'Student' })
      .expect(400);

    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(studentsService.create).not.toHaveBeenCalled();
  });
});
