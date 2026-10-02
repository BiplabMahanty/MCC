const Batch = require('../../models/Batch');
const Subject = require('../../models/Subject');
const Schedule = require('../../models/Schedule');
const User = require('../../models/User');
const AppError = require('../../utils/AppError');
const { ROLES } = require('../../constants/roles');
const { paginationMeta, paginationWindow } = require('../../utils/pagination');

function serialize(doc) {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  delete obj.isDeleted;
  delete obj.deletedAt;
  delete obj.__v;
  return obj;
}

// Returns true if [s1,e1) overlaps [s2,e2) (HH:MM strings compare lexicographically)
function timesOverlap(s1, e1, s2, e2) {
  return s1 < e2 && s2 < e1;
}

async function validateRefs(instituteId, { batchId, subjectId, teacherId }) {
  const checks = [];

  if (batchId) {
    checks.push(
      Batch.exists({ _id: batchId, instituteId, isActive: true, isDeleted: false }).then(
        (r) => { if (!r) throw new AppError('Active batch not found.', 400, 'INVALID_BATCH'); },
      ),
    );
  }

  if (subjectId) {
    checks.push(
      Subject.exists({ _id: subjectId, instituteId, isActive: true, isDeleted: false }).then(
        (r) => { if (!r) throw new AppError('Active subject not found.', 400, 'INVALID_SUBJECT'); },
      ),
    );
  }

  if (teacherId) {
    checks.push(
      User.exists({ _id: teacherId, instituteId, role: ROLES.TEACHER, isActive: true, isDeleted: false }).then(
        (r) => { if (!r) throw new AppError('Active teacher not found.', 400, 'INVALID_TEACHER'); },
      ),
    );
  }

  await Promise.all(checks);
}

async function checkOverlap(instituteId, { dayOfWeek, startTime, endTime, batchId, teacherId }, excludeId) {
  const base = { instituteId, dayOfWeek, isDeleted: false };
  if (excludeId) {
    base._id = { $ne: excludeId };
  }

  const [batchSlots, teacherSlots] = await Promise.all([
    batchId ? Schedule.find({ ...base, batchId }).select('startTime endTime').lean() : [],
    teacherId ? Schedule.find({ ...base, teacherId }).select('startTime endTime').lean() : [],
  ]);

  for (const slot of batchSlots) {
    if (timesOverlap(startTime, endTime, slot.startTime, slot.endTime)) {
      throw new AppError('Batch already has a class in this time slot.', 409, 'SCHEDULE_OVERLAP');
    }
  }

  for (const slot of teacherSlots) {
    if (timesOverlap(startTime, endTime, slot.startTime, slot.endTime)) {
      throw new AppError('Teacher already has a class in this time slot.', 409, 'SCHEDULE_OVERLAP');
    }
  }
}

async function list(instituteId, query) {
  const { page, limit, batchId, dayOfWeek, isActive } = query;
  const { skip } = paginationWindow(page, limit);

  const filter = {
    instituteId,
    isDeleted: false,
    ...(batchId && { batchId }),
    ...(dayOfWeek !== undefined && { dayOfWeek }),
    ...(isActive !== undefined && { isActive }),
  };

  const [docs, total] = await Promise.all([
    Schedule.find(filter)
      .sort({ dayOfWeek: 1, startTime: 1 })
      .skip(skip)
      .limit(limit)
      .select('-isDeleted -deletedAt -__v')
      .populate({ path: 'batchId', select: 'name code' })
      .populate({ path: 'subjectId', select: 'name code' })
      .populate({ path: 'teacherId', select: 'name email' })
      .lean(),
    Schedule.countDocuments(filter),
  ]);

  return { data: docs.map(serialize), pagination: paginationMeta(page, limit, total) };
}

async function getById(instituteId, id) {
  const doc = await Schedule.findOne({ _id: id, instituteId, isDeleted: false })
    .select('-isDeleted -deletedAt -__v')
    .populate({ path: 'batchId', select: 'name code' })
    .populate({ path: 'subjectId', select: 'name code' })
    .populate({ path: 'teacherId', select: 'name email' })
    .lean();

  if (!doc) throw new AppError('Schedule not found.', 404, 'NOT_FOUND');
  return serialize(doc);
}

async function create(instituteId, input) {
  await validateRefs(instituteId, input);
  await checkOverlap(instituteId, input);

  const doc = await Schedule.create({ ...input, instituteId });
  await doc.populate([
    { path: 'batchId', select: 'name code' },
    { path: 'subjectId', select: 'name code' },
    { path: 'teacherId', select: 'name email' },
  ]);
  return serialize(doc);
}

async function update(instituteId, id, input) {
  const current = await Schedule.findOne({ _id: id, instituteId, isDeleted: false });
  if (!current) throw new AppError('Schedule not found.', 404, 'NOT_FOUND');

  await validateRefs(instituteId, input);

  // Merge current values for overlap check
  const merged = {
    dayOfWeek: input.dayOfWeek ?? current.dayOfWeek,
    startTime: input.startTime ?? current.startTime,
    endTime: input.endTime ?? current.endTime,
    batchId: input.batchId ?? current.batchId,
    teacherId: input.teacherId ?? current.teacherId,
  };
  await checkOverlap(instituteId, merged, id);

  Object.assign(current, input);
  await current.save();
  await current.populate([
    { path: 'batchId', select: 'name code' },
    { path: 'subjectId', select: 'name code' },
    { path: 'teacherId', select: 'name email' },
  ]);
  return serialize(current);
}

async function remove(instituteId, id) {
  const current = await Schedule.findOne({ _id: id, instituteId, isDeleted: false });
  if (!current) throw new AppError('Schedule not found.', 404, 'NOT_FOUND');

  current.isActive = false;
  current.isDeleted = true;
  current.deletedAt = new Date();
  await current.save();
}

module.exports = { list, getById, create, update, remove };
