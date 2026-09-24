const ROLES = Object.freeze({
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
});

const ROLE_VALUES = Object.freeze(Object.values(ROLES));

module.exports = {
  ROLES,
  ROLE_VALUES,
};
