const mongoose = require('mongoose');
const Institute = require('../models/Institute');
const User = require('../models/User');
const { ROLES } = require('../constants/roles');
const AppError = require('../utils/AppError');
const { paginationMeta } = require('../utils/pagination');

async function listInstitutes({ page, limit, search, isActive, plan }) {
  const filter = { isDeleted: false };
  if (isActive !== undefined) filter.isActive = isActive;
  if (plan) filter.plan = plan;
  if (search) filter.name = { $regex: search, $options: 'i' };

  const [total, institutes] = await Promise.all([
    Institute.countDocuments(filter),
    Institute.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  return { institutes, pagination: paginationMeta(page, limit, total) };
}

async function getInstituteById(id) {
  const institute = await Institute.findOne({ _id: id, isDeleted: false });
  if (!institute) throw new AppError('Institute not found.', 404, 'NOT_FOUND');
  return institute;
}

async function createInstitute(data) {
  const existing = await Institute.findOne({ slug: data.slug, isDeleted: false });
  if (existing) throw new AppError('Slug is already in use.', 409, 'CONFLICT');

  const { admin, ...instituteData } = data;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const [institute] = await Institute.create([instituteData], { session });
    await User.create(
      [{
        instituteId: institute._id,
        name: admin.name,
        email: institute.contactEmail,
        passwordHash: admin.password,
        role: ROLES.ADMIN,
      }],
      { session },
    );
    await session.commitTransaction();
    return institute;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

async function updateInstitute(id, data) {
  const institute = await Institute.findOne({ _id: id, isDeleted: false });
  if (!institute) throw new AppError('Institute not found.', 404, 'NOT_FOUND');

  if (data.slug && data.slug !== institute.slug) {
    const conflict = await Institute.findOne({ slug: data.slug, isDeleted: false });
    if (conflict) throw new AppError('Slug is already in use.', 409, 'CONFLICT');
  }

  Object.assign(institute, data);
  await institute.save();
  return institute;
}

async function deleteInstitute(id) {
  const institute = await Institute.findOne({ _id: id, isDeleted: false });
  if (!institute) throw new AppError('Institute not found.', 404, 'NOT_FOUND');

  const hasUsers = await User.exists({ instituteId: id, isDeleted: false });
  if (hasUsers) {
    throw new AppError(
      'Cannot delete an institute that still has active users.',
      409,
      'CONFLICT',
    );
  }

  institute.isDeleted = true;
  institute.deletedAt = new Date();
  await institute.save();
}

module.exports = {
  listInstitutes,
  getInstituteById,
  createInstitute,
  updateInstitute,
  deleteInstitute,
};
