const Question = require('../models/Question');
const Subject = require('../models/Subject');
const AppError = require('../utils/AppError');
const { paginationMeta, paginationWindow } = require('../utils/pagination');
const uploadsService = require('./uploads.service');

const writableFields = [
  'subjectId',
  'topic',
  'difficulty',
  'content',
  'options',
  'correctOptionIndex',
  'isActive',
];

function ownedInput(input) {
  return Object.fromEntries(
    writableFields
      .filter((field) => Object.prototype.hasOwnProperty.call(input, field))
      .map((field) => [field, input[field]]),
  );
}

function imageBlocks(question) {
  return [
    ...(question.content || []),
    ...(question.options || []).flatMap((option) => option.content || []),
  ].filter((block) => block.type === 'image');
}

async function validateImages(instituteId, question) {
  const images = imageBlocks(question);
  if (images.length === 0) {
    return;
  }

  if (!uploadsService.storageConfigured()) {
    throw new AppError(
      'Object storage is not configured.',
      503,
      'STORAGE_NOT_CONFIGURED',
    );
  }

  const prefix = `institutes/${instituteId}/questions/`;

  if (images.some((image) => !image.storageKey.startsWith(prefix))) {
    throw new AppError(
      'Question images must belong to the authenticated institute.',
      400,
      'INVALID_IMAGE',
    );
  }

  await Promise.all(
    images.map((image) => uploadsService.verifyQuestionImage(image)),
  );
}

async function validateSubject(instituteId, subjectId) {
  const subject = await Subject.exists({
    _id: subjectId,
    instituteId,
    isActive: true,
    isDeleted: false,
  });

  if (!subject) {
    throw new AppError('Active subject not found.', 400, 'INVALID_SUBJECT');
  }
}

function listFilter(instituteId, query, allowedSubjectIds) {
  const filter = {
    instituteId,
    isDeleted: false,
    ...(query.isActive !== undefined && { isActive: query.isActive }),
    ...(query.subjectId && { subjectId: query.subjectId }),
    ...(query.difficulty && { difficulty: query.difficulty }),
    ...(query.topic && {
      topic: {
        $regex: `^${query.topic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
        $options: 'i',
      },
    }),
    ...(query.search && { $text: { $search: query.search } }),
  };

  if (allowedSubjectIds) {
    filter.subjectId = query.subjectId
      ? { $eq: query.subjectId, $in: allowedSubjectIds }
      : { $in: allowedSubjectIds };
    filter.isActive = true;
  }

  return filter;
}

function summary(question) {
  const previewBlock = question.content.find((block) =>
    ['text', 'formula', 'image', 'table'].includes(block.type),
  );
  const preview =
    previewBlock?.value ||
    previewBlock?.alt ||
    previewBlock?.caption ||
    'Question';
  return {
    _id: question._id,
    subjectId: question.subjectId,
    topic: question.topic,
    difficulty: question.difficulty,
    isActive: question.isActive,
    updatedAt: question.updatedAt,
    preview,
  };
}

async function list(instituteId, query, allowedSubjectIds) {
  const { page, limit } = query;
  const { skip } = paginationWindow(page, limit);
  const filter = listFilter(instituteId, query, allowedSubjectIds);
  const [questions, total] = await Promise.all([
    Question.find(filter)
      .select('subjectId topic difficulty content isActive updatedAt')
      .populate({ path: 'subjectId', select: 'name code' })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Question.countDocuments(filter),
  ]);

  return {
    data: questions.map(summary),
    pagination: paginationMeta(page, limit, total),
  };
}

async function getById(instituteId, id, allowedSubjectIds) {
  const question = await Question.findOne({
    _id: id,
    instituteId,
    isDeleted: false,
    ...(allowedSubjectIds && {
      subjectId: { $in: allowedSubjectIds },
      isActive: true,
    }),
  })
    .select('-searchText -isDeleted -deletedAt -__v')
    .populate({ path: 'subjectId', select: 'name code' })
    .lean();

  if (!question) {
    throw new AppError('Question not found.', 404, 'NOT_FOUND');
  }

  return question;
}

async function create(instituteId, userId, input) {
  await validateSubject(instituteId, input.subjectId);
  await validateImages(instituteId, input);
  const question = await Question.create({
    ...ownedInput(input),
    instituteId,
    createdBy: userId,
    updatedBy: userId,
  });
  await question.populate({ path: 'subjectId', select: 'name code' });
  return question.toJSON();
}

async function update(instituteId, userId, id, input) {
  const question = await Question.findOne({
    _id: id,
    instituteId,
    isDeleted: false,
  });

  if (!question) {
    throw new AppError('Question not found.', 404, 'NOT_FOUND');
  }

  if (input.subjectId) {
    await validateSubject(instituteId, input.subjectId);
  }

  const next = {
    content: input.content || question.content,
    options: input.options || question.options,
  };
  const nextCorrectOptionIndex = Object.prototype.hasOwnProperty.call(
    input,
    'correctOptionIndex',
  )
    ? input.correctOptionIndex
    : question.correctOptionIndex;

  if (nextCorrectOptionIndex >= next.options.length) {
    throw new AppError('Validation failed.', 400, 'VALIDATION_ERROR', [
      {
        field: 'correctOptionIndex',
        message: 'Correct option must reference an existing option.',
      },
    ]);
  }

  await validateImages(instituteId, next);
  Object.assign(question, ownedInput(input), { updatedBy: userId });
  await question.save();
  await question.populate({ path: 'subjectId', select: 'name code' });
  return question.toJSON();
}

async function remove(instituteId, id, userId) {
  const question = await Question.findOneAndUpdate(
    { _id: id, instituteId, isDeleted: false },
    {
      $set: {
        isActive: false,
        isDeleted: true,
        deletedAt: new Date(),
        updatedBy: userId,
      },
    },
  );

  if (!question) {
    throw new AppError('Question not found.', 404, 'NOT_FOUND');
  }
}

async function teacherSubjectIds(instituteId, teacherId) {
  return Subject.find({
    instituteId,
    teacherIds: teacherId,
    isActive: true,
    isDeleted: false,
  }).distinct('_id');
}

async function listForTeacher(instituteId, teacherId, query) {
  return list(
    instituteId,
    query,
    await teacherSubjectIds(instituteId, teacherId),
  );
}

async function getForTeacher(instituteId, teacherId, id) {
  return getById(
    instituteId,
    id,
    await teacherSubjectIds(instituteId, teacherId),
  );
}

module.exports = {
  create,
  getById,
  getForTeacher,
  list,
  listForTeacher,
  remove,
  update,
};
