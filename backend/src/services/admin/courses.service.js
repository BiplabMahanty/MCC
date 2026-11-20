const Batch = require('../../models/Batch');
const Course = require('../../models/Course');
const AppError = require('../../utils/AppError');
const createAcademicCrudService = require('./academicCrud.service');

async function beforeRemove({ instituteId, current }) {
  const hasBatches = await Batch.exists({
    instituteId,
    courseId: current._id,
    isDeleted: false,
  });

  if (hasBatches) {
    throw new AppError(
      'Delete the course batches first.',
      409,
      'COURSE_IN_USE',
    );
  }
}

module.exports = createAcademicCrudService({
  Model: Course,
  beforeRemove,
});
