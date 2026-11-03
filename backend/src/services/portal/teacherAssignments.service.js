const Assignment = require('../../models/Assignment');
const Batch = require('../../models/Batch');
const Subject = require('../../models/Subject');
const AppError = require('../../utils/AppError');

async function listAssignments(teacherId, instituteId) {
  const assignments = await Assignment.find({
    instituteId,
    createdBy: teacherId,
    isDeleted: false,
  })
    .populate('batchId', 'name code')
    .populate('subjectId', 'name code')
    .sort({ dueAt: -1 })
    .lean();

  return assignments;
}

async function createAssignment(teacherId, instituteId, input) {
  const { title, description, batchId, subjectId, dueAt } = input;

  if (!title || !title.trim()) {
    throw new AppError('Title is required', 400, 'VALIDATION_ERROR');
  }
  if (!batchId) {
    throw new AppError('Batch is required', 400, 'VALIDATION_ERROR');
  }
  if (!subjectId) {
    throw new AppError('Subject is required', 400, 'VALIDATION_ERROR');
  }
  if (!dueAt) {
    throw new AppError('Due date is required', 400, 'VALIDATION_ERROR');
  }

  // Verify batch exists and belongs to institute
  const batch = await Batch.findOne({
    _id: batchId,
    instituteId,
    isDeleted: false,
  });
  if (!batch) {
    throw new AppError('Batch not found', 404, 'NOT_FOUND');
  }

  // Verify subject exists and belongs to institute
  const subject = await Subject.findOne({
    _id: subjectId,
    instituteId,
    isDeleted: false,
  });
  if (!subject) {
    throw new AppError('Subject not found', 404, 'NOT_FOUND');
  }

  const assignment = new Assignment({
    instituteId,
    batchId,
    subjectId,
    title: title.trim(),
    description: description?.trim() || '',
    dueAt: new Date(dueAt),
    createdBy: teacherId,
  });

  await assignment.save();
  await assignment.populate('batchId', 'name code');
  await assignment.populate('subjectId', 'name code');

  return assignment;
}

async function getAssignment(teacherId, instituteId, assignmentId) {
  const assignment = await Assignment.findOne({
    _id: assignmentId,
    instituteId,
    createdBy: teacherId,
    isDeleted: false,
  })
    .populate('batchId', 'name code')
    .populate('subjectId', 'name code')
    .lean();

  if (!assignment) {
    throw new AppError('Assignment not found', 404, 'NOT_FOUND');
  }

  return assignment;
}

async function updateAssignment(teacherId, instituteId, assignmentId, input) {
  const { title, description, batchId, subjectId, dueAt } = input;

  const assignment = await Assignment.findOne({
    _id: assignmentId,
    instituteId,
    createdBy: teacherId,
    isDeleted: false,
  });

  if (!assignment) {
    throw new AppError('Assignment not found', 404, 'NOT_FOUND');
  }

  if (title) {
    if (!title.trim()) {
      throw new AppError('Title cannot be empty', 400, 'VALIDATION_ERROR');
    }
    assignment.title = title.trim();
  }

  if (description !== undefined) {
    assignment.description = description?.trim() || '';
  }

  if (batchId) {
    const batch = await Batch.findOne({
      _id: batchId,
      instituteId,
      isDeleted: false,
    });
    if (!batch) {
      throw new AppError('Batch not found', 404, 'NOT_FOUND');
    }
    assignment.batchId = batchId;
  }

  if (subjectId) {
    const subject = await Subject.findOne({
      _id: subjectId,
      instituteId,
      isDeleted: false,
    });
    if (!subject) {
      throw new AppError('Subject not found', 404, 'NOT_FOUND');
    }
    assignment.subjectId = subjectId;
  }

  if (dueAt) {
    assignment.dueAt = new Date(dueAt);
  }

  await assignment.save();
  await assignment.populate('batchId', 'name code');
  await assignment.populate('subjectId', 'name code');

  return assignment;
}

async function deleteAssignment(teacherId, instituteId, assignmentId) {
  const assignment = await Assignment.findOne({
    _id: assignmentId,
    instituteId,
    createdBy: teacherId,
    isDeleted: false,
  });

  if (!assignment) {
    throw new AppError('Assignment not found', 404, 'NOT_FOUND');
  }

  assignment.isDeleted = true;
  await assignment.save();
}

module.exports = {
  listAssignments,
  createAssignment,
  getAssignment,
  updateAssignment,
  deleteAssignment,
};
