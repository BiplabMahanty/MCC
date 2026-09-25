const Batch = require('../../models/Batch');
const Exam = require('../../models/Exam');
const Result = require('../../models/Result');
const User = require('../../models/User');
const { redisClient } = require('../../config/redis');
const { ROLES } = require('../../constants/roles');

const CACHE_TTL_SECONDS = 60;

function dateFilter(query = {}) {
  const createdAt = {};
  if (query.from) createdAt.$gte = new Date(query.from);
  if (query.to) {
    const until = new Date(query.to);
    until.setUTCHours(23, 59, 59, 999);
    createdAt.$lte = until;
  }
  return Object.keys(createdAt).length ? { createdAt } : {};
}

function cacheKey(instituteId, query) {
  const from = query.from
    ? new Date(query.from).toISOString().slice(0, 10)
    : 'all';
  const to = query.to ? new Date(query.to).toISOString().slice(0, 10) : 'all';
  return `admin-analytics:v1:${instituteId}:${from}:${to}`;
}

async function getCached(key) {
  if (!redisClient.isOpen) return null;
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

async function cache(key, value) {
  if (!redisClient.isOpen) return;
  try {
    await redisClient.setEx(key, CACHE_TTL_SECONDS, JSON.stringify(value));
  } catch {
    // Analytics remains available when Redis is temporarily unavailable.
  }
}

async function getAnalytics(instituteId, query = {}) {
  const key = cacheKey(instituteId, query);
  const cached = await getCached(key);
  if (cached) return { ...cached, cached: true };

  const base = { instituteId, ...dateFilter(query) };
  const active = { instituteId, isDeleted: false };

  const [
    resultSummary,
    exams,
    students,
    teachers,
    batches,
    batchPerformance,
    teacherPerformance,
    recentExams,
  ] = await Promise.all([
    Result.aggregate([
      { $match: base },
      {
        $group: {
          _id: null,
          submissions: { $sum: 1 },
          averagePercentage: { $avg: '$percentage' },
          averageMarks: { $avg: '$obtainedMarks' },
          highestMarks: { $max: '$obtainedMarks' },
          lowestMarks: { $min: '$obtainedMarks' },
        },
      },
    ]),
    Exam.countDocuments(active),
    User.countDocuments({ ...active, role: ROLES.STUDENT }),
    User.countDocuments({ ...active, role: ROLES.TEACHER }),
    Batch.countDocuments(active),
    Result.aggregate([
      { $match: base },
      {
        $lookup: {
          from: 'exams',
          localField: 'examId',
          foreignField: '_id',
          as: 'exam',
        },
      },
      { $unwind: '$exam' },
      {
        $group: {
          _id: '$exam.batchId',
          averagePercentage: { $avg: '$percentage' },
          submissions: { $sum: 1 },
        },
      },
      { $sort: { averagePercentage: -1 } },
      { $limit: 10 },
    ]),
    Exam.aggregate([
      { $match: active },
      { $unwind: { path: '$teacherIds', preserveNullAndEmptyArrays: false } },
      { $group: { _id: '$teacherIds', assignedExams: { $sum: 1 } } },
      { $sort: { assignedExams: -1 } },
      { $limit: 10 },
    ]),
    Result.aggregate([
      { $match: base },
      {
        $group: {
          _id: '$examId',
          submissions: { $sum: 1 },
          averagePercentage: { $avg: '$percentage' },
          highestMarks: { $max: '$obtainedMarks' },
        },
      },
      { $sort: { averagePercentage: -1 } },
      { $limit: 8 },
    ]),
  ]);

  const summary = resultSummary[0] || {};
  const [batchDocs, teacherDocs, examDocs] = await Promise.all([
    Batch.find({
      _id: { $in: batchPerformance.map((item) => item._id) },
      ...active,
    })
      .select('name code')
      .lean(),
    User.find({
      _id: { $in: teacherPerformance.map((item) => item._id) },
      ...active,
    })
      .select('name email')
      .lean(),
    Exam.find({
      _id: { $in: recentExams.map((item) => item._id) },
      ...active,
    })
      .select('name examType startTime')
      .lean(),
  ]);
  const names = (docs) => new Map(docs.map((doc) => [String(doc._id), doc]));
  const batchById = names(batchDocs);
  const teacherById = names(teacherDocs);
  const examById = names(examDocs);
  const round = (number) => Math.round((number || 0) * 100) / 100;

  const data = {
    cached: false,
    generatedAt: new Date().toISOString(),
    summary: {
      students,
      teachers,
      batches,
      exams,
      submissions: summary.submissions || 0,
      averagePercentage: round(summary.averagePercentage),
      averageMarks: round(summary.averageMarks),
      highestMarks: summary.highestMarks || 0,
      lowestMarks: summary.lowestMarks || 0,
    },
    batchAnalytics: batchPerformance.map((item) => ({
      batchId: item._id,
      batchName: batchById.get(String(item._id))?.name || 'Deleted batch',
      batchCode: batchById.get(String(item._id))?.code || '',
      submissions: item.submissions,
      averagePercentage: round(item.averagePercentage),
    })),
    teacherAnalytics: teacherPerformance.map((item) => ({
      teacherId: item._id,
      teacherName: teacherById.get(String(item._id))?.name || 'Deleted teacher',
      assignedExams: item.assignedExams,
    })),
    performanceReports: recentExams.map((item) => ({
      examId: item._id,
      examName: examById.get(String(item._id))?.name || 'Deleted exam',
      examType: examById.get(String(item._id))?.examType || '',
      startTime: examById.get(String(item._id))?.startTime || null,
      submissions: item.submissions,
      averagePercentage: round(item.averagePercentage),
      highestMarks: item.highestMarks,
    })),
  };
  await cache(key, data);
  return data;
}

module.exports = { getAnalytics };
