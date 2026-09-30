const { ROLES } = require('../../constants/roles');
const Batch = require('../../models/Batch');
const Subject = require('../../models/Subject');
const User = require('../../models/User');
const AppError = require('../../utils/AppError');
const { publicPerson } = require('./portalSerializers');

const studentSelection =
  'name email phone role instituteId isActive studentProfile createdAt updatedAt';
const teacherSelection =
  'name email phone role instituteId isActive teacherProfile createdAt updatedAt';

async function getStudent(userId, instituteId) {
  const student = await User.findOne({
    _id: userId,
    instituteId,
    role: ROLES.STUDENT,
    isActive: true,
    isDeleted: false,
  })
    .select(studentSelection)
    .populate({ path: 'studentProfile.batchId', select: 'name code' })
    .lean();

  if (!student) {
    throw new AppError('Student profile not found.', 404, 'NOT_FOUND');
  }

  return student;
}

async function getProfile(userId, instituteId) {
  return publicPerson(await getStudent(userId, instituteId), 'studentProfile');
}

async function findBatch(userId, instituteId) {
  const student = await getStudent(userId, instituteId);
  const batchId = student.studentProfile?.batchId?._id;

  if (!batchId) {
    return null;
  }

  return Batch.findOne({
    _id: batchId,
    instituteId,
    isActive: true,
    isDeleted: false,
  })
    .select('-isDeleted -deletedAt -__v')
    .populate({ path: 'courseId', select: 'name code description' })
    .lean();
}

async function getBatch(userId, instituteId) {
  const batch = await findBatch(userId, instituteId);
  if (!batch) {
    return null;
  }

  const result = { ...batch };
  delete result.teacherIds;
  return result;
}

async function getSubjects(userId, instituteId) {
  const batch = await findBatch(userId, instituteId);
  if (!batch) {
    return [];
  }

  return Subject.find({
    instituteId,
    courseId: batch.courseId._id,
    teacherIds: { $in: batch.teacherIds || [] },
    isActive: true,
    isDeleted: false,
  })
    .select('-isDeleted -deletedAt -__v -teacherIds')
    .sort({ name: 1 })
    .lean();
}

async function getTeachers(userId, instituteId) {
  const batch = await findBatch(userId, instituteId);
  if (!batch) {
    return [];
  }

  const subjectTeacherIds = await Subject.find({
    instituteId,
    courseId: batch.courseId._id,
    isActive: true,
    isDeleted: false,
  }).distinct('teacherIds');
  const teacherIds = [
    ...new Set(
      [...(batch.teacherIds || []), ...subjectTeacherIds].map((id) =>
        String(id),
      ),
    ),
  ];

  if (teacherIds.length === 0) {
    return [];
  }

  const teachers = await User.find({
    _id: { $in: teacherIds },
    instituteId,
    role: ROLES.TEACHER,
    isActive: true,
    isDeleted: false,
  })
    .select(teacherSelection)
    .sort({ name: 1 })
    .lean();

  return teachers.map((teacher) => publicPerson(teacher, 'teacherProfile'));
}

async function getDashboard(userId, instituteId) {
  const batch = await getBatch(userId, instituteId);
  if (!batch) {
    return { batch: null, subjects: 0, teachers: 0 };
  }

  const [subjects, teachers] = await Promise.all([
    Subject.countDocuments({
      instituteId,
      courseId: batch.courseId._id,
      isActive: true,
      isDeleted: false,
    }),
    getTeachers(userId, instituteId),
  ]);

  return {
    batch: { _id: batch._id, name: batch.name, code: batch.code },
    subjects,
    teachers: teachers.length,
  };
}

module.exports = {
  getBatch,
  getDashboard,
  getProfile,
  getSubjects,
  getTeachers,
};
