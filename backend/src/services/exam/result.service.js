const ExamAttempt = require('../../models/ExamAttempt');
const Result = require('../../models/Result');
const AppError = require('../../utils/AppError');
const { calcGrade } = require('../../models/Result');
const { paginationMeta, paginationWindow } = require('../../utils/pagination');

/**
 * Called after submit/auto-submit. Creates or updates the Result document
 * and recalculates ranks for all submitted attempts of this exam.
 */
async function createOrUpdateResult(attempt) {
  const grade = calcGrade(attempt.percentage);

  await Result.findOneAndUpdate(
    { attemptId: attempt._id },
    {
      instituteId: attempt.instituteId,
      examId: attempt.examId,
      attemptId: attempt._id,
      studentId: attempt.studentId,
      totalQuestions: attempt.totalQuestions,
      attempted: attempt.attempted,
      correct: attempt.correct,
      wrong: attempt.wrong,
      unanswered: attempt.unanswered,
      obtainedMarks: attempt.obtainedMarks,
      totalMarks: attempt.totalMarks,
      percentage: attempt.percentage,
      grade,
    },
    { upsert: true, new: true },
  );

  await recalcRanks(attempt.examId);
}

async function recalcRanks(examId) {
  const results = await Result.find({ examId })
    .sort({ obtainedMarks: -1 })
    .lean();
  const bulk = results.map((r, i) => ({
    updateOne: {
      filter: { _id: r._id },
      update: { $set: { rank: i + 1 } },
    },
  }));
  if (bulk.length) await Result.bulkWrite(bulk);
}

// ── Admin ─────────────────────────────────────────────────────────────────────

async function listExamResults(examId, instituteId, query) {
  const { page, limit } = query;
  const { skip } = paginationWindow(page, limit);
  const filter = { examId, instituteId };

  const [results, total] = await Promise.all([
    Result.find(filter)
      .populate({ path: 'studentId', select: 'name email studentProfile' })
      .sort({ rank: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Result.countDocuments(filter),
  ]);

  return { data: results, pagination: paginationMeta(page, limit, total) };
}

async function publishResults(examId, instituteId, adminId) {
  const count = await Result.countDocuments({ examId, instituteId });
  if (count === 0)
    throw new AppError('No results to publish.', 400, 'NO_RESULTS');

  await Result.updateMany(
    { examId, instituteId },
    { isPublished: true, publishedAt: new Date(), publishedBy: adminId },
  );
  return { published: count };
}

async function unpublishResults(examId, instituteId) {
  await Result.updateMany(
    { examId, instituteId },
    { isPublished: false, publishedAt: null, publishedBy: null },
  );
}

// ── Student ───────────────────────────────────────────────────────────────────

async function getStudentResult(studentId, instituteId, examId) {
  const result = await Result.findOne({
    examId,
    studentId,
    instituteId,
    isPublished: true,
  })
    .populate({
      path: 'examId',
      select: 'name examType academicSession totalMarks',
    })
    .lean();

  if (!result) throw new AppError('Result not available.', 404, 'NOT_FOUND');
  return result;
}

async function listStudentResults(studentId, instituteId, query) {
  const { page, limit } = query;
  const { skip } = paginationWindow(page, limit);
  const filter = { studentId, instituteId, isPublished: true };

  const [results, total] = await Promise.all([
    Result.find(filter)
      .populate({
        path: 'examId',
        select: 'name examType academicSession startTime',
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Result.countDocuments(filter),
  ]);

  return { data: results, pagination: paginationMeta(page, limit, total) };
}

// ── Teacher ───────────────────────────────────────────────────────────────────

async function listTeacherExamResults(examId, instituteId, query) {
  const { page, limit } = query;
  const { skip } = paginationWindow(page, limit);
  const filter = { examId, instituteId };

  const [results, total] = await Promise.all([
    Result.find(filter)
      .populate({ path: 'studentId', select: 'name email studentProfile' })
      .sort({ rank: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Result.countDocuments(filter),
  ]);

  return { data: results, pagination: paginationMeta(page, limit, total) };
}

// ── Attempt result (post-submit) ──────────────────────────────────────────────

async function getAttemptResult(attemptId, studentId) {
  const attempt = await ExamAttempt.findOne({
    _id: attemptId,
    studentId,
  }).lean();
  if (!attempt) throw new AppError('Attempt not found.', 404, 'NOT_FOUND');

  const result = await Result.findOne({ attemptId }).lean();
  return { attempt, result };
}

module.exports = {
  createOrUpdateResult,
  getAttemptResult,
  getStudentResult,
  listExamResults,
  listStudentResults,
  listTeacherExamResults,
  publishResults,
  recalcRanks,
  unpublishResults,
};
