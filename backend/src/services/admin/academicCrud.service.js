const { paginationMeta, paginationWindow } = require('../../utils/pagination');
const { searchFilter } = require('../../utils/queryFilters');
const AppError = require('../../utils/AppError');

function serialize(document) {
  const result = document.toObject ? document.toObject() : { ...document };
  delete result.isDeleted;
  delete result.deletedAt;
  delete result.__v;
  return result;
}

function withoutSystemFields(input) {
  const safeInput = { ...input };
  delete safeInput.instituteId;
  delete safeInput.isDeleted;
  delete safeInput.deletedAt;
  return safeInput;
}

function createAcademicCrudService({
  Model,
  searchFields = ['name', 'code'],
  populate,
  beforeWrite,
  beforeRemove,
}) {
  async function list(instituteId, query) {
    const { page, limit, search, isActive, courseId } = query;
    const { skip } = paginationWindow(page, limit);
    const filter = {
      instituteId,
      isDeleted: false,
      ...(isActive !== undefined && { isActive }),
      ...(courseId && { courseId }),
      ...searchFilter(search, searchFields),
    };
    let findQuery = Model.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-isDeleted -deletedAt -__v');

    if (populate) {
      findQuery = findQuery.populate(populate);
    }

    const [documents, total] = await Promise.all([
      findQuery.lean(),
      Model.countDocuments(filter),
    ]);

    return {
      data: documents.map(serialize),
      pagination: paginationMeta(page, limit, total),
    };
  }

  async function getById(instituteId, id) {
    let query = Model.findOne({
      _id: id,
      instituteId,
      isDeleted: false,
    }).select('-isDeleted -deletedAt -__v');

    if (populate) {
      query = query.populate(populate);
    }

    const document = await query.lean();

    if (!document) {
      throw new AppError('Record not found.', 404, 'NOT_FOUND');
    }

    return serialize(document);
  }

  async function create(instituteId, input) {
    if (beforeWrite) {
      await beforeWrite({ instituteId, input });
    }

    const document = await Model.create({
      ...withoutSystemFields(input),
      instituteId,
    });
    if (populate) {
      await document.populate(populate);
    }
    return serialize(document);
  }

  async function update(instituteId, id, input) {
    const current = await Model.findOne({
      _id: id,
      instituteId,
      isDeleted: false,
    });

    if (!current) {
      throw new AppError('Record not found.', 404, 'NOT_FOUND');
    }

    if (beforeWrite) {
      await beforeWrite({ instituteId, input, current });
    }

    Object.assign(current, withoutSystemFields(input));
    await current.save();
    if (populate) {
      await current.populate(populate);
    }
    return serialize(current);
  }

  async function remove(instituteId, id) {
    const current = await Model.findOne({
      _id: id,
      instituteId,
      isDeleted: false,
    });

    if (!current) {
      throw new AppError('Record not found.', 404, 'NOT_FOUND');
    }

    if (beforeRemove) {
      await beforeRemove({ instituteId, current });
    }

    current.isActive = false;
    current.isDeleted = true;
    current.deletedAt = new Date();
    await current.save();
  }

  return {
    create,
    getById,
    list,
    remove,
    update,
  };
}

module.exports = createAcademicCrudService;
