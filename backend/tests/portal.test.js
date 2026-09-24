process.env.NODE_ENV = 'test';

jest.mock('../src/services/portal/teacher.service', () => ({
  getBatches: jest.fn(),
  getDashboard: jest.fn(),
  getProfile: jest.fn(),
  getStudents: jest.fn(),
  getSubjects: jest.fn(),
}));

jest.mock('../src/services/portal/student.service', () => ({
  getBatch: jest.fn(),
  getDashboard: jest.fn(),
  getProfile: jest.fn(),
  getSubjects: jest.fn(),
  getTeachers: jest.fn(),
}));

jest.mock('../src/models/User', () => ({
  findOne: jest.fn(),
}));

const jwt = require('jsonwebtoken');
const request = require('supertest');

const app = require('../src/app');
const env = require('../src/config/env');
const User = require('../src/models/User');
const studentService = require('../src/services/portal/student.service');
const teacherService = require('../src/services/portal/teacher.service');

const instituteId = '66f000000000000000000010';
const userId = '66f000000000000000000001';

function token(role) {
  return jwt.sign({ role, instituteId }, env.jwtAccessSecret, {
    subject: userId,
    expiresIn: '5m',
  });
}

function authenticateAs(role) {
  User.findOne.mockResolvedValue({ _id: userId, instituteId, role });
}

describe('Teacher and Student portal routes', () => {
  test('returns the institute-scoped Teacher dashboard', async () => {
    authenticateAs('teacher');
    teacherService.getDashboard.mockResolvedValue({
      batches: 2,
      subjects: 3,
      students: 40,
    });

    const response = await request(app)
      .get('/api/teacher/dashboard')
      .set('Authorization', `Bearer ${token('teacher')}`)
      .expect(200);

    expect(teacherService.getDashboard).toHaveBeenCalledWith(
      userId,
      instituteId,
    );
    expect(response.body.data.students).toBe(40);
  });

  test('returns Student batch information', async () => {
    authenticateAs('student');
    studentService.getBatch.mockResolvedValue({
      _id: '66f000000000000000000020',
      name: 'Batch A',
    });

    const response = await request(app)
      .get('/api/student/batch')
      .set('Authorization', `Bearer ${token('student')}`)
      .expect(200);

    expect(studentService.getBatch).toHaveBeenCalledWith(userId, instituteId);
    expect(response.body.data.name).toBe('Batch A');
  });

  test('does not allow a Student to access Teacher data', async () => {
    authenticateAs('student');

    await request(app)
      .get('/api/teacher/students')
      .set('Authorization', `Bearer ${token('student')}`)
      .expect(403);

    expect(teacherService.getStudents).not.toHaveBeenCalled();
  });

  test('requires authentication for Student portal data', async () => {
    await request(app).get('/api/student/profile').expect(401);
    expect(studentService.getProfile).not.toHaveBeenCalled();
  });
});
