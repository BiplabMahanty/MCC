const Batch = require('../../models/Batch');
const Course = require('../../models/Course');
const Question = require('../../models/Question');
const Subject = require('../../models/Subject');
const User = require('../../models/User');
const { ROLES } = require('../../constants/roles');

async function getDashboard(instituteId) {
  const baseFilter = { instituteId, isDeleted: false };
  const [students, teachers, batches, courses, subjects, questions] =
    await Promise.all([
      User.countDocuments({ ...baseFilter, role: ROLES.STUDENT }),
      User.countDocuments({ ...baseFilter, role: ROLES.TEACHER }),
      Batch.countDocuments(baseFilter),
      Course.countDocuments(baseFilter),
      Subject.countDocuments(baseFilter),
      Question.countDocuments(baseFilter),
    ]);

  return {
    students,
    teachers,
    batches,
    courses,
    subjects,
    questions,
  };
}

module.exports = {
  getDashboard,
};
