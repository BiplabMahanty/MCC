process.env.NODE_ENV = 'test';

const createAcademicCrudService = require('../src/services/admin/academicCrud.service');

function document(values = {}) {
  return {
    instituteId: '66f000000000000000000010',
    isDeleted: false,
    deletedAt: null,
    name: 'Science',
    save: jest.fn().mockResolvedValue(undefined),
    toObject() {
      return { ...this };
    },
    ...values,
  };
}

describe('academic CRUD service tenant protection', () => {
  test('create always uses the authenticated institute and ignores system fields', async () => {
    const created = document();
    const Model = { create: jest.fn().mockResolvedValue(created) };
    const service = createAcademicCrudService({ Model });

    await service.create('trusted-institute', {
      name: 'Science',
      instituteId: 'attacker-institute',
      isDeleted: true,
      deletedAt: new Date(),
    });

    expect(Model.create).toHaveBeenCalledWith({
      name: 'Science',
      instituteId: 'trusted-institute',
    });
  });

  test('update keeps tenant and soft-delete fields under server control', async () => {
    const current = document();
    const Model = { findOne: jest.fn().mockResolvedValue(current) };
    const service = createAcademicCrudService({ Model });

    await service.update('66f000000000000000000010', 'record-id', {
      name: 'Updated Science',
      instituteId: 'attacker-institute',
      isDeleted: true,
      deletedAt: new Date(),
    });

    expect(Model.findOne).toHaveBeenCalledWith({
      _id: 'record-id',
      instituteId: '66f000000000000000000010',
      isDeleted: false,
    });
    expect(current.name).toBe('Updated Science');
    expect(current.instituteId).toBe('66f000000000000000000010');
    expect(current.isDeleted).toBe(false);
    expect(current.deletedAt).toBeNull();
    expect(current.save).toHaveBeenCalledTimes(1);
  });

  test('remove performs an institute-scoped soft delete', async () => {
    const current = document({ isActive: true });
    const Model = { findOne: jest.fn().mockResolvedValue(current) };
    const service = createAcademicCrudService({ Model });

    await service.remove('66f000000000000000000010', 'record-id');

    expect(Model.findOne).toHaveBeenCalledWith({
      _id: 'record-id',
      instituteId: '66f000000000000000000010',
      isDeleted: false,
    });
    expect(current.isActive).toBe(false);
    expect(current.isDeleted).toBe(true);
    expect(current.deletedAt).toBeInstanceOf(Date);
    expect(current.save).toHaveBeenCalledTimes(1);
  });
});
