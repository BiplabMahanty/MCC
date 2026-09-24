const Batch = require('../../models/Batch');
const Exam = require('../../models/Exam');
const Question = require('../../models/Question');
const Subject = require('../../models/Subject');
const User = require('../../models/User');
const AppError = require('../../utils/AppError');
const { paginationMeta, paginationWindow } = require('../../utils/pagination');
const { ROLES } = require('../../constants/roles');

const populateRefs = [
  { path: 'batchId', select: 'name code' },
  { path: 'subjectId', select: 'name code' },
  { path: 'teacherIds', select: 'name email' },
];

async function validateRelations(instituteId, input) {
  const checks = [];

  if (input.batchId) {
    checks.push(
      Batch.exists({ _id: input.batchId, instituteId, isDeleted: false }).then(
        (exists) => {
          if (!exists)
            throw new AppError('Batch not found.', 400, 'INVALID_BATCH');
        },
      ),
    );
  }

  if (input.subjectId) {
    checks.push(
      Subject.exists({
        _id: input.subjectId,
        instituteId,
        isDeleted: false,
      }).then((exists) => {
        if (!exists)
          throw new AppError('Subject not found.', 400, 'INVALID_SUBJECT');
      }),
    );
  }

  if (input.teacherIds?.length) {
    checks.push(
      User.countDocuments({
        _id: { $in: input.teacherIds },
        instituteId,
        role: ROLES.TEACHER,
        isDeleted: false,
      }).then((count) => {
        if (count !== input.teacherIds.length)
          throw new AppError(
            'One or more teachers not found.',
            400,
            'INVALID_TEACHER',
          );
      }),
    );
  }

  if (input.questionIds?.length) {
    checks.push(
      Question.countDocuments({
        _id: { $in: input.questionIds },
        instituteId,
        isDeleted: false,
      }).then((count) => {
        if (count !== input.questionIds.length)
          throw new AppError(
            'One or more questions not found.',
            400,
            'INVALID_QUESTION',
          );
      }),
    );
  }

  await Promise.all(checks);
}

function safeExam(exam) {
  const obj = exam.toJSON ? exam.toJSON() : exam;
  return obj;
}

async function list(instituteId, query) {
  const { page, limit, status, batchId, subjectId } = query;
  const { skip } = paginationWindow(page, limit);
  const filter = {
    instituteId,
    isDeleted: false,
    ...(status && { status }),
    ...(batchId && { batchId }),
    ...(subjectId && { subjectId }),
  };

  const [exams, total] = await Promise.all([
    Exam.find(filter)
      .select('-questions -questionIds -isDeleted -deletedAt -__v')
      .populate(populateRefs)
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Exam.countDocuments(filter),
  ]);

  return { data: exams, pagination: paginationMeta(page, limit, total) };
}

async function getById(instituteId, id) {
  const exam = await Exam.findOne({ _id: id, instituteId, isDeleted: false })
    .populate(populateRefs)
    .lean();

  if (!exam) throw new AppError('Exam not found.', 404, 'NOT_FOUND');

  // Strip correctOptionIndex from snapshot questions
  if (exam.questions) {
    exam.questions = exam.questions.map((q) => {
      const copy = { ...q };
      delete copy.correctOptionIndex;
      return copy;
    });
  }

  return exam;
}

async function create(instituteId, userId, input) {
  await validateRelations(instituteId, input);

  const exam = await Exam.create({
    ...input,
    instituteId,
    createdBy: userId,
    updatedBy: userId,
  });

  await exam.populate(populateRefs);
  return safeExam(exam);
}

async function update(instituteId, userId, id, input) {
  const exam = await Exam.findOne({ _id: id, instituteId, isDeleted: false });
  if (!exam) throw new AppError('Exam not found.', 404, 'NOT_FOUND');
  if (exam.status === 'published')
    throw new AppError(
      'Published exams cannot be edited. Unpublish first.',
      409,
      'EXAM_PUBLISHED',
    );

  await validateRelations(instituteId, input);
  Object.assign(exam, input, { updatedBy: userId });
  await exam.save();
  await exam.populate(populateRefs);
  return safeExam(exam);
}

async function publish(instituteId, userId, id) {
  const exam = await Exam.findOne({ _id: id, instituteId, isDeleted: false });
  if (!exam) throw new AppError('Exam not found.', 404, 'NOT_FOUND');
  if (exam.status === 'published')
    throw new AppError('Exam is already published.', 409, 'ALREADY_PUBLISHED');
  if (!exam.questionIds.length)
    throw new AppError(
      'Add at least one question before publishing.',
      400,
      'NO_QUESTIONS',
    );

  // Snapshot questions at publish time
  const questions = await Question.find({
    _id: { $in: exam.questionIds },
    instituteId,
    isDeleted: false,
  })
    .select('content options correctOptionIndex topic difficulty')
    .lean();

  if (questions.length !== exam.questionIds.length)
    throw new AppError(
      'One or more questions were deleted. Update the question list.',
      400,
      'INVALID_QUESTION',
    );

  exam.questions = questions.map((q) => ({
    questionId: q._id,
    content: q.content,
    options: q.options.map((opt) => ({ _id: opt._id, content: opt.content })),
    correctOptionIndex: q.correctOptionIndex,
    topic: q.topic,
    difficulty: q.difficulty,
  }));

  exam.status = 'published';
  exam.publishedAt = new Date();
  exam.publishedBy = userId;
  exam.updatedBy = userId;
  await exam.save();
  await exam.populate(populateRefs);
  return safeExam(exam);
}

async function unpublish(instituteId, userId, id) {
  const exam = await Exam.findOne({ _id: id, instituteId, isDeleted: false });
  if (!exam) throw new AppError('Exam not found.', 404, 'NOT_FOUND');
  if (exam.status !== 'published')
    throw new AppError('Exam is not published.', 409, 'NOT_PUBLISHED');

  exam.status = 'draft';
  exam.questions = [];
  exam.updatedBy = userId;
  await exam.save();
  await exam.populate(populateRefs);
  return safeExam(exam);
}

async function remove(instituteId, userId, id) {
  const exam = await Exam.findOne({ _id: id, instituteId, isDeleted: false });
  if (!exam) throw new AppError('Exam not found.', 404, 'NOT_FOUND');
  if (exam.status === 'published')
    throw new AppError(
      'Unpublish the exam before deleting it.',
      409,
      'EXAM_PUBLISHED',
    );

  exam.isDeleted = true;
  exam.deletedAt = new Date();
  exam.updatedBy = userId;
  await exam.save();
}

module.exports = { create, getById, list, publish, remove, unpublish, update };
