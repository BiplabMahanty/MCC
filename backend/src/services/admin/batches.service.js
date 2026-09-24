const Batch = require('../../models/Batch');
const Course = require('../../models/Course');
const AppError = require('../../utils/AppError');
const createAcademicCrudService = require('./academicCrud.service');
const { validateTeachers } = require('./assignmentValidation.service');

async function beforeWrite({ instituteId, input, current }) {
  await validateTeachers(instituteId, input.teacherIds);

  if (input.courseId) {
    const course = await Course.exists({
      _id: input.courseId,
      instituteId,
      isActive: true,
      isDeleted: false,
    });

    if (!course) {
      throw new AppError('Active course not found.', 400, 'INVALID_COURSE');
    }
  }

  const startDate = input.startDate
    ? new Date(`${input.startDate}T00:00:00.000Z`)
    : current?.startDate;
  const endDate = input.endDate
    ? new Date(`${input.endDate}T00:00:00.000Z`)
    : current?.endDate;

  if (startDate && endDate && endDate < startDate) {
    throw new AppError(
      'End date must be on or after start date.',
      400,
      'INVALID_DATE_RANGE',
    );
  }
}

module.exports = createAcademicCrudService({
  Model: Batch,
  beforeWrite,
  populate: [
    { path: 'courseId', select: 'name code' },
    {
      path: 'teacherIds',
      select: 'name email teacherProfile.employeeCode',
      match: { isActive: true, isDeleted: false },
    },
  ],
});
