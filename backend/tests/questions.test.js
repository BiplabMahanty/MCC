process.env.NODE_ENV = 'test';

jest.mock('../src/services/questions.service', () => ({
  create: jest.fn(),
  getById: jest.fn(),
  getForTeacher: jest.fn(),
  list: jest.fn(),
  listForTeacher: jest.fn(),
  remove: jest.fn(),
  update: jest.fn(),
}));

jest.mock('../src/services/uploads.service', () => ({
  createQuestionImageUpload: jest.fn(),
}));

jest.mock('../src/models/User', () => ({
  findOne: jest.fn(),
}));

const jwt = require('jsonwebtoken');
const request = require('supertest');

const app = require('../src/app');
const env = require('../src/config/env');
const User = require('../src/models/User');
const questionsService = require('../src/services/questions.service');

const instituteId = '66f000000000000000000010';
const userId = '66f000000000000000000001';
const subjectId = '66f000000000000000000020';

function token(role) {
  return jwt.sign({ role, instituteId }, env.jwtAccessSecret, {
    subject: userId,
    expiresIn: '5m',
  });
}

function authenticateAs(role) {
  User.findOne.mockResolvedValue({ _id: userId, instituteId, role });
}

function validQuestion() {
  return {
    subjectId,
    topic: 'Algebra',
    difficulty: 'medium',
    content: [
      { type: 'text', value: 'Solve the equation.' },
      { type: 'formula', value: 'x^2 - 4 = 0' },
      {
        type: 'table',
        caption: 'Values',
        headers: ['x', 'y'],
        rows: [
          ['1', '2'],
          ['2', '4'],
        ],
      },
    ],
    options: [
      { content: [{ type: 'text', value: 'x = 2' }] },
      { content: [{ type: 'formula', value: 'x = \\pm 2' }] },
    ],
    correctOptionIndex: 1,
    isActive: true,
  };
}

describe('Question Bank routes', () => {
  test('validates and creates a structured Admin question', async () => {
    authenticateAs('admin');
    questionsService.create.mockResolvedValue({
      _id: '66f000000000000000000030',
      ...validQuestion(),
    });

    await request(app)
      .post('/api/admin/questions')
      .set('Authorization', `Bearer ${token('admin')}`)
      .send(validQuestion())
      .expect(201);

    expect(questionsService.create).toHaveBeenCalledWith(
      instituteId,
      userId,
      validQuestion(),
    );
  });

  test('rejects invalid table dimensions', async () => {
    authenticateAs('admin');
    const question = validQuestion();
    question.content[2].rows = [['one cell']];

    const response = await request(app)
      .post('/api/admin/questions')
      .set('Authorization', `Bearer ${token('admin')}`)
      .send(question)
      .expect(400);

    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(questionsService.create).not.toHaveBeenCalled();
  });

  test('rejects a correct option outside the option list', async () => {
    authenticateAs('admin');
    const question = validQuestion();
    question.correctOptionIndex = 4;

    await request(app)
      .post('/api/admin/questions')
      .set('Authorization', `Bearer ${token('admin')}`)
      .send(question)
      .expect(400);

    expect(questionsService.create).not.toHaveBeenCalled();
  });

  test('rejects invalid LaTeX before storage', async () => {
    authenticateAs('admin');
    const question = validQuestion();
    question.content[1].value = String.raw`\frac{`;

    await request(app)
      .post('/api/admin/questions')
      .set('Authorization', `Bearer ${token('admin')}`)
      .send(question)
      .expect(400);

    expect(questionsService.create).not.toHaveBeenCalled();
  });

  test('allows a Teacher to list only service-scoped questions', async () => {
    authenticateAs('teacher');
    questionsService.listForTeacher.mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });

    await request(app)
      .get('/api/teacher/questions?difficulty=hard')
      .set('Authorization', `Bearer ${token('teacher')}`)
      .expect(200);

    expect(questionsService.listForTeacher).toHaveBeenCalledWith(
      instituteId,
      userId,
      { page: 1, limit: 20, difficulty: 'hard' },
    );
  });

  test('does not allow a Teacher to create an Admin question', async () => {
    authenticateAs('teacher');

    await request(app)
      .post('/api/admin/questions')
      .set('Authorization', `Bearer ${token('teacher')}`)
      .send(validQuestion())
      .expect(403);

    expect(questionsService.create).not.toHaveBeenCalled();
  });

  test('rejects unsupported question-image uploads before signing', async () => {
    authenticateAs('admin');

    const response = await request(app)
      .post('/api/admin/uploads/question-image')
      .set('Authorization', `Bearer ${token('admin')}`)
      .send({ fileName: 'diagram.gif', mimeType: 'image/gif', size: 100 })
      .expect(400);

    expect(response.body.code).toBe('VALIDATION_ERROR');
  });
});
