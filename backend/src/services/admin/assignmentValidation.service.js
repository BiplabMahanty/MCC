const { ROLES } = require('../../constants/roles');
const Batch = require('../../models/Batch');
const User = require('../../models/User');
const AppError = require('../../utils/AppError');

async function validateBatch(instituteId, batchId) {
  if (!batchId) {
    return;
  }

  const batch = await Batch.exists({
    _id: batchId,
    instituteId,
    isActive: true,
    isDeleted: false,
  });

  if (!batch) {
    throw new AppError('Active batch not found.', 400, 'INVALID_BATCH');
  }
}

async function validateTeachers(instituteId, teacherIds) {
  if (!teacherIds) {
    return;
  }

  const uniqueIds = [...new Set(teacherIds)];
  const count = await User.countDocuments({
    _id: { $in: uniqueIds },
    instituteId,
    role: ROLES.TEACHER,
    isActive: true,
    isDeleted: false,
  });

  if (count !== uniqueIds.length) {
    throw new AppError(
      'One or more active teachers were not found.',
      400,
      'INVALID_TEACHER',
    );
  }
}

module.exports = {
  validateBatch,
  validateTeachers,
};
