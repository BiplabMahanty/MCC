const { paginationMeta, paginationWindow } = require('../../utils/pagination');
const { searchFilter } = require('../../utils/queryFilters');
const AppError = require('../../utils/AppError');
const User = require('../../models/User');

const commonFields = ['name', 'email', 'phone', 'isActive'];

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function serializePerson(person, profileKey) {
  const value = person.toObject ? person.toObject() : person;
  const profileValue = value[profileKey];
  const profile = profileValue?.toObject
    ? profileValue.toObject()
    : profileValue || {};
  const result = { ...value, ...profile };

  delete result.passwordHash;
  delete result.refreshTokens;
  delete result.studentProfile;
  delete result.teacherProfile;
  delete result.isDeleted;
  delete result.deletedAt;
  delete result.__v;

  return result;
}

function createPeopleService({
  role,
  profileKey,
  profileFields,
  codeField,
  beforeWrite,
  populate,
}) {
  const searchFields = ['name', 'email', 'phone', `${profileKey}.${codeField}`];
const selection = `name email phone role instituteId isActive ${profileKey} createdAt updatedAt`;

  async function list(instituteId, query) {
    const { page, limit, search, isActive } = query;
    const { skip } = paginationWindow(page, limit);
    const filter = {
      instituteId,
      role,
      isDeleted: false,
      ...(isActive !== undefined && { isActive }),
      ...searchFilter(search, searchFields),
    };

    let peopleQuery = User.find(filter)
      .select(selection)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    if (populate) {
      peopleQuery = peopleQuery.populate(populate);
    }

    const [people, total] = await Promise.all([
      peopleQuery,
      User.countDocuments(filter),
    ]);

    return {
      data: people.map((person) => serializePerson(person, profileKey)),
      pagination: paginationMeta(page, limit, total),
    };
  }

  async function getById(instituteId, id) {
    let personQuery = User.findOne({
      _id: id,
      instituteId,
      role,
      isDeleted: false,
    }).select(selection);

    if (populate) {
      personQuery = personQuery.populate(populate);
    }

    const person = await personQuery.lean();

    if (!person) {
      throw new AppError('Record not found.', 404, 'NOT_FOUND');
    }

    return serializePerson(person, profileKey);
  }

  async function create(instituteId, input) {
    if (beforeWrite) {
      await beforeWrite({ instituteId, input });
    }

    const profile = Object.fromEntries(
      profileFields.map((field) => [field, input[field]]),
    );
    const person = await User.create({
      instituteId,
      role,
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash: input.password,
      isActive: input.isActive,
      [profileKey]: profile,
    });

    if (populate) {
      await person.populate(populate);
    }

    return serializePerson(person, profileKey);
  }

  async function update(instituteId, id, input) {
    const person = await User.findOne({
      _id: id,
      instituteId,
      role,
      isDeleted: false,
    }).select(`+${profileKey}`);

    if (!person) {
      throw new AppError('Record not found.', 404, 'NOT_FOUND');
    }

    if (beforeWrite) {
      await beforeWrite({ instituteId, input, current: person });
    }

    commonFields.forEach((field) => {
      if (hasOwn(input, field)) {
        person[field] = input[field];
      }
    });

    if (input.password) {
      person.passwordHash = input.password;
    }

    const currentProfile =
      person[profileKey]?.toObject?.() || person[profileKey] || {};
    const nextProfile = { ...currentProfile };
    profileFields.forEach((field) => {
      if (hasOwn(input, field)) {
        nextProfile[field] = input[field];
      }
    });
    person[profileKey] = nextProfile;

    await person.save();
    if (populate) {
      await person.populate(populate);
    }
    return serializePerson(person, profileKey);
  }

  async function remove(instituteId, id) {
    const person = await User.findOneAndUpdate(
      { _id: id, instituteId, role, isDeleted: false },
      {
        $set: {
          isActive: false,
          isDeleted: true,
          deletedAt: new Date(),
          refreshTokens: [],
        },
      },
    );

    if (!person) {
      throw new AppError('Record not found.', 404, 'NOT_FOUND');
    }
  }

  return {
    create,
    getById,
    list,
    remove,
    update,
  };
}

module.exports = createPeopleService;
