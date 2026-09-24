const Course = require('../../models/Course');
const Subject = require('../../models/Subject');
const AppError = require('../../utils/AppError');
const createAcademicCrudService = require('./academicCrud.service');
const { validateTeachers } = require('./assignmentValidation.service');

async function beforeWrite({ instituteId, input }) {
  await validateTeachers(instituteId, input.teacherIds);

  if (!input.courseId) {
    return;
  }

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

module.exports = createAcademicCrudService({
  Model: Subject,
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
