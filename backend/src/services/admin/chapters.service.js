const Chapter = require('../../models/Chapter');
const Subject = require('../../models/Subject');
const AppError = require('../../utils/AppError');
const createAcademicCrudService = require('./academicCrud.service');

async function beforeWrite({ instituteId, input }) {
  if (!input.subjectId) return;
  const exists = await Subject.exists({
    _id: input.subjectId,
    instituteId,
    isActive: true,
    isDeleted: false,
  });
  if (!exists) throw new AppError('Active subject not found.', 400, 'INVALID_SUBJECT');
}

module.exports = createAcademicCrudService({
  Model: Chapter,
  beforeWrite,
  populate: [{ path: 'subjectId', select: 'name code' }],
});
