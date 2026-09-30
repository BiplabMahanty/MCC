const { ROLES } = require('../../constants/roles');
const createPeopleService = require('./people.service');

module.exports = createPeopleService({
  role: ROLES.TEACHER,
  profileKey: 'teacherProfile',
  codeField: 'employeeCode',
  profileFields: ['employeeCode', 'qualification', 'experienceYears', 'profileImage'],
});
