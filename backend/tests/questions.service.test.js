process.env.NODE_ENV = 'test';

jest.mock('../src/models/Question', () => ({
  findOne: jest.fn(),
}));

jest.mock('../src/models/Subject', () => ({
  exists: jest.fn(),
  find: jest.fn(),
}));

const Question = require('../src/models/Question');
const questionsService = require('../src/services/questions.service');

const instituteId = '66f000000000000000000010';
const userId = '66f000000000000000000001';

function option(value) {
  return { content: [{ type: 'text', value }] };
}

describe('Question service', () => {
  test('rejects an update that removes the currently correct option', async () => {
    const record = {
      instituteId,
      content: [{ type: 'text', value: 'Question' }],
      options: [option('A'), option('B'), option('C'), option('D')],
      correctOptionIndex: 3,
      save: jest.fn(),
    };
    Question.findOne.mockResolvedValue(record);

    await expect(
      questionsService.update(instituteId, userId, 'question-id', {
        options: [option('A'), option('B')],
      }),
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      details: [expect.objectContaining({ field: 'correctOptionIndex' })],
    });

    expect(record.save).not.toHaveBeenCalled();
  });
});
