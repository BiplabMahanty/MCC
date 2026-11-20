const Subject = require('../../models/Subject');
const createAcademicCrudService = require('./academicCrud.service');
const { validateTeachers } = require('./assignmentValidation.service');

async function beforeWrite({ instituteId, input }) {
  await validateTeachers(instituteId, input.teacherIds);

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
