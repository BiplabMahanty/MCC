const Attendance = require('../models/Attendance');
const Batch = require('../models/Batch');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { ROLES } = require('../constants/roles');

function day(value) {
  const date = new Date(value);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

async function verifyBatch(instituteId, batchId, teacherId) {
  const filter = { _id: batchId, instituteId, isActive: true, isDeleted: false };
  if (teacherId) filter.teacherIds = teacherId;
  const batch = await Batch.findOne(filter).lean();
  if (!batch) throw new AppError('Batch not found.', 404, 'NOT_FOUND');
  return batch;
}

async function mark(instituteId, userId, input, teacherId) {
  await verifyBatch(instituteId, input.batchId, teacherId);
  const ids = input.entries.map((item) => item.studentId);
  if (new Set(ids).size !== ids.length) {
    throw new AppError('Each student can be marked once.', 400, 'DUPLICATE_STUDENT');
  }
  const students = await User.countDocuments({
    _id: { $in: ids },
    instituteId,
    role: ROLES.STUDENT,
    'studentProfile.batchId': input.batchId,
    isActive: true,
    isDeleted: false,
  });
  if (students !== ids.length) throw new AppError('Invalid batch student.', 400, 'INVALID_STUDENT');

  return Attendance.findOneAndUpdate(
    { instituteId, batchId: input.batchId, date: day(input.date) },
    { $set: { entries: input.entries, markedBy: userId } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();
}

async function list(instituteId, query = {}, teacherId) {
  const filter = { instituteId };
  if (query.batchId) {
    await verifyBatch(instituteId, query.batchId, teacherId);
    filter.batchId = query.batchId;
  }
  if (query.date) filter.date = day(query.date);
  if (query.month) {
    const start = new Date(`${query.month}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 1);
    filter.date = { $gte: start, $lt: end };
  }
  return Attendance.find(filter).sort({ date: -1 }).limit(100).lean();
}

async function studentSummary(studentId, instituteId, query = {}) {
  const student = await User.findOne({ _id: studentId, instituteId, role: ROLES.STUDENT, isDeleted: false }).lean();
  if (!student?.studentProfile?.batchId) return { records: [], summary: { total: 0, present: 0, percentage: 0 } };
  const records = await list(instituteId, { ...query, batchId: student.studentProfile.batchId });
  const statuses = records.map((record) => record.entries.find((entry) => String(entry.studentId) === String(studentId))?.status).filter(Boolean);
  const present = statuses.filter((status) => ['present', 'late'].includes(status)).length;
  return {
    records: records.map((record) => {
      const entry = record.entries.find(
        (item) => String(item.studentId) === String(studentId),
      );
      return { _id: record._id, date: record.date, status: entry?.status || null, note: entry?.note || '' };
    }),
    summary: {
      total: statuses.length,
      present,
      percentage: statuses.length
        ? Math.round((present / statuses.length) * 10000) / 100
        : 0,
    },
  };
}

module.exports = { list, mark, studentSummary };
