const mongoose = require('mongoose');

const { connectMongo, disconnectMongo } = require('../config/database');
const env = require('../config/env');
const logger = require('../config/logger');
const { ROLES } = require('../constants/roles');
const User = require('../models/User');

function assertSeedConfig() {
  const required = {
    SEED_ADMIN_NAME: env.seedAdminName,
    SEED_ADMIN_EMAIL: env.seedAdminEmail,
    SEED_ADMIN_PASSWORD: env.seedAdminPassword,
    SEED_ADMIN_INSTITUTE_ID: env.seedAdminInstituteId,
  };

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Missing seed configuration: ${missing.join(', ')}`);
  }

  if (!mongoose.isObjectIdOrHexString(env.seedAdminInstituteId)) {
    throw new Error(
      'SEED_ADMIN_INSTITUTE_ID must be a valid MongoDB ObjectId.',
    );
  }

  if (env.seedAdminPassword.length < 12) {
    throw new Error('SEED_ADMIN_PASSWORD must contain at least 12 characters.');
  }

  if (env.seedAdminPassword.startsWith('replace-with-')) {
    throw new Error(
      'SEED_ADMIN_PASSWORD must be changed from the example value.',
    );
  }
}

async function seedAdmin() {
  assertSeedConfig();
  await connectMongo();

  const email = env.seedAdminEmail.trim().toLowerCase();
  const existingAdmin = await User.findOne({ email, isDeleted: false });

  if (existingAdmin) {
    logger.info({ email }, 'Admin user already exists; no changes made');
    return;
  }

  await User.create({
    instituteId: env.seedAdminInstituteId,
    name: env.seedAdminName.trim(),
    email,
    passwordHash: env.seedAdminPassword,
    role: ROLES.ADMIN,
  });

  logger.info({ email }, 'Initial admin user created');
}

seedAdmin()
  .catch((error) => {
    logger.fatal({ err: error }, 'Admin seed failed');
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectMongo();
  });
