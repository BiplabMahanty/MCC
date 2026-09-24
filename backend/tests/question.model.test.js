process.env.NODE_ENV = 'test';

const Question = require('../src/models/Question');

function question(overrides = {}) {
  return new Question({
    instituteId: '66f000000000000000000010',
    subjectId: '66f000000000000000000020',
    topic: 'Quadratic equations',
    difficulty: 'medium',
    content: [
      { type: 'text', value: 'Find the roots.' },
      { type: 'formula', value: 'x^2 + 5x + 6 = 0' },
    ],
    options: [
      { content: [{ type: 'text', value: '-2 and -3' }] },
      { content: [{ type: 'text', value: '2 and 3' }] },
    ],
    correctOptionIndex: 0,
    createdBy: '66f000000000000000000001',
    updatedBy: '66f000000000000000000001',
    ...overrides,
  });
}

describe('Question model', () => {
  test('builds searchable text from structured blocks and options', async () => {
    const record = question();
    await record.validate();

    expect(record.searchText).toContain('quadratic equations');
    expect(record.searchText).toContain('x^2 + 5x + 6 = 0');
    expect(record.searchText).toContain('-2 and -3');
  });

  test('rejects a correct option index outside the option collection', async () => {
    const record = question({ correctOptionIndex: 5 });
    await expect(record.validate()).rejects.toThrow(
      'Correct option must reference an existing option.',
    );
  });

  test('does not serialize internal search or soft-delete fields', async () => {
    const record = question({ isDeleted: false, deletedAt: null });
    await record.validate();
    const serialized = record.toJSON();

    expect(serialized.searchText).toBeUndefined();
    expect(serialized.isDeleted).toBeUndefined();
    expect(serialized.deletedAt).toBeUndefined();
  });
});
