process.env.NODE_ENV = 'test';

jest.mock('../src/services/admin/exams.service', () => ({
  list: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  publish: jest.fn(),
  unpublish: jest.fn(),
  remove: jest.fn(),
}));

jest.mock('../src/queues/examQueue', () => ({
  scheduleAutoSubmit: jest.fn().mockResolvedValue('job-1'),
  cancelAutoSubmit: jest.fn().mockResolvedValue(),
  examQueue: {},
}));

jest.mock('../src/models/User', () => ({ findOne: jest.fn() }));

const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../src/app');
const env = require('../src/config/env');
const User = require('../src/models/User');
const examsService = require('../src/services/admin/exams.service');

const adminUser = {
  _id: '66f000000000000000000001',
  instituteId: '66f000000000000000000010',
  role: 'admin',
};

function adminToken() {
  return jwt.sign(
    { role: adminUser.role, instituteId: adminUser.instituteId },
    env.jwtAccessSecret,
    { subject: adminUser._id, expiresIn: '5m' },
  );
}

const examStub = {
  _id: '66f000000000000000000099',
  name: 'Unit Test 1',
  status: 'draft',
  batchId: { _id: '66f000000000000000000020', name: 'Batch A' },
  subjectId: { _id: '66f000000000000000000030', name: 'Math' },
};

describe('Admin exam routes', () => {
  beforeEach(() => {
    User.findOne.mockResolvedValue(adminUser);
  });

  test('GET /api/admin/exams returns paginated list', async () => {
    examsService.list.mockResolvedValue({ data: [examStub], pagination: {} });

    const res = await request(app)
      .get('/api/admin/exams')
      .set('Authorization', `Bearer ${adminToken()}`)
      .expect(200);

    expect(res.body.data).toHaveLength(1);
    expect(examsService.list).toHaveBeenCalled();
  });

  test('POST /api/admin/exams creates an exam', async () => {
    examsService.create.mockResolvedValue(examStub);

    const body = {
      name: 'Unit Test 1',
      examType: 'unit_test',
      academicSession: '2025-26',
      batchId: '66f000000000000000000020',
      subjectId: '66f000000000000000000030',
      questionIds: ['66f000000000000000000050'],
      durationMinutes: 60,
      startTime: '2025-12-01T09:00:00.000Z',
      endTime: '2025-12-01T10:00:00.000Z',
      totalMarks: 100,
      marksPerQuestion: 2,
    };

    const res = await request(app)
      .post('/api/admin/exams')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send(body)
      .expect(201);

    expect(res.body.data).toMatchObject({ name: 'Unit Test 1' });
  });

  test('POST /api/admin/exams rejects invalid body', async () => {
    const res = await request(app)
      .post('/api/admin/exams')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ name: 'x' })
      .expect(400);

    expect(res.body.code).toBe('VALIDATION_ERROR');
    expect(examsService.create).not.toHaveBeenCalled();
  });

  test('POST /api/admin/exams/:id/publish publishes an exam', async () => {
    examsService.publish.mockResolvedValue({
      ...examStub,
      status: 'published',
    });

    const res = await request(app)
      .post(`/api/admin/exams/${examStub._id}/publish`)
      .set('Authorization', `Bearer ${adminToken()}`)
      .expect(200);

    expect(res.body.data.status).toBe('published');
  });

  test('DELETE /api/admin/exams/:id soft-deletes an exam', async () => {
    examsService.remove.mockResolvedValue();

    await request(app)
      .delete(`/api/admin/exams/${examStub._id}`)
      .set('Authorization', `Bearer ${adminToken()}`)
      .expect(204);
  });

  test('Teacher token is rejected on admin exam routes', async () => {
    const teacherToken = jwt.sign(
      { role: 'teacher', instituteId: adminUser.instituteId },
      env.jwtAccessSecret,
      { subject: adminUser._id, expiresIn: '5m' },
    );
    User.findOne.mockResolvedValue({ ...adminUser, role: 'teacher' });

    await request(app)
      .get('/api/admin/exams')
      .set('Authorization', `Bearer ${teacherToken}`)
      .expect(403);
  });
});
