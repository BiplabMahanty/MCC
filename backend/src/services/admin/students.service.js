const { ROLES } = require('../../constants/roles');
const { validateBatch } = require('./assignmentValidation.service');
const createPeopleService = require('./people.service');

async function beforeWrite({ instituteId, input }) {
  if (Object.prototype.hasOwnProperty.call(input, 'batchId')) {
    await validateBatch(instituteId, input.batchId);
  }
}

module.exports = createPeopleService({
  role: ROLES.STUDENT,
  profileKey: 'studentProfile',
  codeField: 'studentCode',
  beforeWrite,
  populate: {
    path: 'studentProfile.batchId',
    select: 'name code',
    match: { isActive: true, isDeleted: false },
  },
  profileFields: [
    'studentCode',
    'batchId',
    'dateOfBirth',
    'guardianName',
    'guardianPhone',
  ],
});
