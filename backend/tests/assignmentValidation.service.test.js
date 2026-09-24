process.env.NODE_ENV = 'test';

jest.mock('../src/models/Batch', () => ({
  exists: jest.fn(),
}));

jest.mock('../src/models/User', () => ({
  countDocuments: jest.fn(),
}));

const Batch = require('../src/models/Batch');
const User = require('../src/models/User');
const {
  validateBatch,
  validateTeachers,
} = require('../src/services/admin/assignmentValidation.service');

const instituteId = '66f000000000000000000010';

describe('assignment validation', () => {
  test('checks that a batch is active and belongs to the institute', async () => {
    Batch.exists.mockResolvedValue({ _id: 'batch-id' });

    await validateBatch(instituteId, 'batch-id');

    expect(Batch.exists).toHaveBeenCalledWith({
      _id: 'batch-id',
      instituteId,
      isActive: true,
      isDeleted: false,
    });
  });

  test('rejects a batch outside the active institute scope', async () => {
    Batch.exists.mockResolvedValue(null);

    await expect(validateBatch(instituteId, 'batch-id')).rejects.toMatchObject({
      code: 'INVALID_BATCH',
      statusCode: 400,
    });
  });

  test('validates every assigned teacher in the same institute', async () => {
    User.countDocuments.mockResolvedValue(2);

    await validateTeachers(instituteId, ['teacher-1', 'teacher-2']);

    expect(User.countDocuments).toHaveBeenCalledWith({
      _id: { $in: ['teacher-1', 'teacher-2'] },
      instituteId,
      role: 'teacher',
      isActive: true,
      isDeleted: false,
    });
  });

  test('rejects an invalid teacher assignment', async () => {
    User.countDocuments.mockResolvedValue(1);

    await expect(
      validateTeachers(instituteId, ['teacher-1', 'teacher-2']),
    ).rejects.toMatchObject({ code: 'INVALID_TEACHER', statusCode: 400 });
  });
});
