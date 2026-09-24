const Batch = require('../../models/Batch');
const Exam = require('../../models/Exam');
const Subject = require('../../models/Subject');
const User = require('../../models/User');
const AppError = require('../../utils/AppError');
const { ROLES } = require('../../constants/roles');
const { paginationMeta, paginationWindow } = require('../../utils/pagination');

const examListSelect = '-questions -questionIds -isDeleted -deletedAt -__v';

const populateRefs = [
  { path: 'batchId', select: 'name code' },
  { path: 'subjectId', select: 'name code' },
];

// ── Teacher ──────────────────────────────────────────────────────────────────

async function teacherExamFilter(userId, instituteId) {
  const [batchIds, subjectIds] = await Promise.all([
    Batch.find({
      instituteId,
      teacherIds: userId,
      isActive: true,
      isDeleted: false,
    }).distinct('_id'),
    Subject.find({
      instituteId,
      teacherIds: userId,
      isActive: true,
      isDeleted: false,
    }).distinct('_id'),
  ]);

  return {
    instituteId,
    isDeleted: false,
    status: 'published',
    $or: [
      { batchId: { $in: batchIds } },
      { subjectId: { $in: subjectIds } },
      { teacherIds: userId },
    ],
  };
}

async function listTeacherExams(userId, instituteId, query) {
  const { page, limit } = query;
  const { skip } = paginationWindow(page, limit);
  const filter = await teacherExamFilter(userId, instituteId);

  const [exams, total] = await Promise.all([
    Exam.find(filter)
      .select(examListSelect)
      .populate(populateRefs)
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Exam.countDocuments(filter),
  ]);

  return { data: exams, pagination: paginationMeta(page, limit, total) };
}

async function getTeacherExam(userId, instituteId, id) {
  const filter = await teacherExamFilter(userId, instituteId);
  filter._id = id;

  const exam = await Exam.findOne(filter).populate(populateRefs).lean();
  if (!exam) throw new AppError('Exam not found.', 404, 'NOT_FOUND');

  // Strip correct answers from snapshot
  if (exam.questions) {
    exam.questions = exam.questions.map((q) => {
      const copy = { ...q };
      delete copy.correctOptionIndex;
      return copy;
    });
  }

  return exam;
}

// ── Student ───────────────────────────────────────────────────────────────────

async function getStudentBatchAndSubjects(userId, instituteId) {
  const student = await User.findOne({
    _id: userId,
    instituteId,
    role: ROLES.STUDENT,
    isActive: true,
    isDeleted: false,
  })
    .select('studentProfile')
    .lean();

  if (!student) throw new AppError('Student not found.', 404, 'NOT_FOUND');

  const batchId = student.studentProfile?.batchId;
  if (!batchId) return { batchId: null, subjectIds: [] };

  const subjectIds = await Subject.find({
    instituteId,
    isActive: true,
    isDeleted: false,
  }).distinct('_id');

  return { batchId, subjectIds };
}

async function listStudentExams(userId, instituteId, query) {
  const { page, limit } = query;
  const { skip } = paginationWindow(page, limit);
  const { batchId } = await getStudentBatchAndSubjects(userId, instituteId);

  if (!batchId) {
    return { data: [], pagination: paginationMeta(page, limit, 0) };
  }

  const filter = {
    instituteId,
    batchId,
    isDeleted: false,
    status: 'published',
  };

  const [exams, total] = await Promise.all([
    Exam.find(filter)
      .select(examListSelect)
      .populate(populateRefs)
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Exam.countDocuments(filter),
  ]);

  return { data: exams, pagination: paginationMeta(page, limit, total) };
}

async function getStudentExam(userId, instituteId, id) {
  const { batchId } = await getStudentBatchAndSubjects(userId, instituteId);
  if (!batchId) throw new AppError('Exam not found.', 404, 'NOT_FOUND');

  const exam = await Exam.findOne({
    _id: id,
    instituteId,
    batchId,
    isDeleted: false,
    status: 'published',
  })
    .populate(populateRefs)
    .lean();

  if (!exam) throw new AppError('Exam not found.', 404, 'NOT_FOUND');

  // Never send correct answers to students
  if (exam.questions) {
    exam.questions = exam.questions.map((q) => {
      const copy = { ...q };
      delete copy.correctOptionIndex;
      return copy;
    });
  }

  return exam;
}

module.exports = {
  getStudentExam,
  getTeacherExam,
  listStudentExams,
  listTeacherExams,
};
