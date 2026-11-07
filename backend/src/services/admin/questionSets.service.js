const Question = require('../../models/Question');
const QuestionSet = require('../../models/QuestionSet');
const Subject = require('../../models/Subject');
const AppError = require('../../utils/AppError');
const { paginationMeta, paginationWindow } = require('../../utils/pagination');

const populateRefs = [
  { path: 'subjectId', select: 'name code' },
  { path: 'createdBy', select: 'name email' },
  { path: 'updatedBy', select: 'name email' },
];

async function validateRelations(instituteId, input) {
  const checks = [];

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

function safeQuestionSet(set) {
  const obj = set.toJSON ? set.toJSON() : set;
  return obj;
}

async function list(instituteId, query) {
  const { page, limit, subjectId, search } = query;
  const { skip } = paginationWindow(page, limit);

  const filter = {
    instituteId,
    isDeleted: false,
    ...(subjectId && { subjectId }),
    ...(search && { name: { $regex: search, $options: 'i' } }),
  };

  const [sets, total] = await Promise.all([
    QuestionSet.find(filter)
      .select('-questionIds -isDeleted -deletedAt -__v')
      .populate(populateRefs)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    QuestionSet.countDocuments(filter),
  ]);

  return { data: sets, pagination: paginationMeta(page, limit, total) };
}

async function getById(instituteId, id) {
  const set = await QuestionSet.findOne({
    _id: id,
    instituteId,
    isDeleted: false,
  })
    .populate(populateRefs)
    .lean();

  if (!set) throw new AppError('Question set not found.', 404, 'NOT_FOUND');

  return set;
}

async function create(instituteId, userId, input) {
  await validateRelations(instituteId, input);

  const set = await QuestionSet.create({
    ...input,
    totalQuestions: input.questionIds.length,
    instituteId,
    createdBy: userId,
    updatedBy: userId,
  });

  await set.populate(populateRefs);
  return safeQuestionSet(set);
}

async function update(instituteId, userId, id, input) {
  const set = await QuestionSet.findOne({
    _id: id,
    instituteId,
    isDeleted: false,
  });

  if (!set) throw new AppError('Question set not found.', 404, 'NOT_FOUND');

  await validateRelations(instituteId, input);

  Object.assign(set, input, {
    updatedBy: userId,
    ...(input.questionIds && { totalQuestions: input.questionIds.length }),
  });

  await set.save();
  await set.populate(populateRefs);
  return safeQuestionSet(set);
}

async function remove(instituteId, userId, id) {
  const set = await QuestionSet.findOne({
    _id: id,
    instituteId,
    isDeleted: false,
  });

  if (!set) throw new AppError('Question set not found.', 404, 'NOT_FOUND');

  set.isDeleted = true;
  set.deletedAt = new Date();
  set.updatedBy = userId;
  await set.save();
}

module.exports = { create, getById, list, remove, update };
