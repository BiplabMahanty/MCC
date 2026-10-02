const { ROLES } = require('../../constants/roles');
const Batch = require('../../models/Batch');
const Question = require('../../models/Question');
const Subject = require('../../models/Subject');
const User = require('../../models/User');
const AppError = require('../../utils/AppError');
const { publicPerson } = require('./portalSerializers');

const teacherSelection =
  'name email phone role instituteId isActive teacherProfile createdAt updatedAt';

function assignedBatchFilter(userId, instituteId) {
  return {
    instituteId,
    teacherIds: userId,
    isActive: true,
    isDeleted: false,
  };
}

async function getProfile(userId, instituteId) {
  const teacher = await User.findOne({
    _id: userId,
    instituteId,
    role: ROLES.TEACHER,
    isDeleted: false,
  })
    .select(teacherSelection)
    .lean();

  if (!teacher) {
    throw new AppError('Teacher profile not found.', 404, 'NOT_FOUND');
  }

  return publicPerson(teacher, 'teacherProfile');
}

async function getBatches(userId, instituteId) {
  return Batch.find(assignedBatchFilter(userId, instituteId))
    .select('-teacherIds -isDeleted -deletedAt -__v')
    .populate({ path: 'courseId', select: 'name code' })
    .sort({ startDate: -1 })
    .lean();
}

async function getSubjects(userId, instituteId) {
  return Subject.find({
    instituteId,
    teacherIds: userId,
    isActive: true,
    isDeleted: false,
  })
    .select('-teacherIds -isDeleted -deletedAt -__v')
    .populate({ path: 'courseId', select: 'name code' })
    .sort({ name: 1 })
    .lean();
}

async function getStudents(userId, instituteId) {
  const batchIds = await Batch.find(
    assignedBatchFilter(userId, instituteId),
  ).distinct('_id');

  if (batchIds.length === 0) {
    return [];
  }

  const students = await User.find({
    instituteId,
    role: ROLES.STUDENT,
    'studentProfile.batchId': { $in: batchIds },
    isActive: true,
    isDeleted: false,
  })
    .select(
      'name email phone role instituteId isActive studentProfile createdAt updatedAt',
    )
    .populate({ path: 'studentProfile.batchId', select: 'name code' })
    .sort({ name: 1 })
    .lean();

  return students.map((student) => publicPerson(student, 'studentProfile'));
}

async function getDashboard(userId, instituteId) {
  const [batchIds, subjectIds] = await Promise.all([
    Batch.find(assignedBatchFilter(userId, instituteId)).distinct('_id'),
    Subject.find({
      instituteId,
      teacherIds: userId,
      isActive: true,
      isDeleted: false,
    }).distinct('_id'),
  ]);
  const [students, questions] = await Promise.all([
    batchIds.length
      ? User.countDocuments({
          instituteId,
          role: ROLES.STUDENT,
          'studentProfile.batchId': { $in: batchIds },
          isActive: true,
          isDeleted: false,
        })
      : 0,
    subjectIds.length
      ? Question.countDocuments({
          instituteId,
          subjectId: { $in: subjectIds },
          isActive: true,
          isDeleted: false,
        })
      : 0,
  ]);

  return {
    batches: batchIds.length,
    subjects: subjectIds.length,
    students,
    questions,
  };
}

async function getSchedule(userId, instituteId) {
  const batchIds = await Batch.find(
    assignedBatchFilter(userId, instituteId),
  ).distinct('_id');

  if (batchIds.length === 0) return [];

  const Schedule = require('../../models/Schedule');
  return Schedule.find({
    instituteId,
    $or: [{ teacherId: userId }, { batchId: { $in: batchIds } }],
    isActive: true,
    isDeleted: false,
  })
    .sort({ dayOfWeek: 1, startTime: 1 })
    .select('-isDeleted -deletedAt -__v')
    .populate({ path: 'batchId', select: 'name code' })
    .populate({ path: 'subjectId', select: 'name code' })
    .lean();
}

module.exports = {
  getBatches,
  getDashboard,
  getProfile,
  getSchedule,
  getStudents,
  getSubjects,
};
