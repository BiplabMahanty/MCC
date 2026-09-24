const Batch = require('../../models/Batch');
const Course = require('../../models/Course');
const Subject = require('../../models/Subject');
const AppError = require('../../utils/AppError');
const createAcademicCrudService = require('./academicCrud.service');

async function beforeRemove({ instituteId, current }) {
  const [hasBatches, hasSubjects] = await Promise.all([
    Batch.exists({ instituteId, courseId: current._id, isDeleted: false }),
    Subject.exists({ instituteId, courseId: current._id, isDeleted: false }),
  ]);

  if (hasBatches || hasSubjects) {
    throw new AppError(
      'Delete the course batches and subjects first.',
      409,
      'COURSE_IN_USE',
    );
  }
}

module.exports = createAcademicCrudService({
  Model: Course,
  beforeRemove,
});
