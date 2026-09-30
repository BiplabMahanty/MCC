const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');

const { connectMongo, disconnectMongo } = require('../config/database');
const env = require('../config/env');
const logger = require('../config/logger');
const { ROLES } = require('../constants/roles');
const Institute = require('../models/Institute');
const User = require('../models/User');

function assertSeedConfig() {
  const required = {
    SEED_ADMIN_NAME: env.seedAdminName,
    SEED_ADMIN_EMAIL: env.seedAdminEmail,
    SEED_ADMIN_PASSWORD: env.seedAdminPassword,
    SEED_ADMIN_INSTITUTE_ID: env.seedAdminInstituteId,
    SEED_ADMIN_INSTITUTE_NAME: env.seedAdminInstituteName,
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

  // Upsert the Institute document using the fixed seed ID
  const instituteId = new mongoose.Types.ObjectId(env.seedAdminInstituteId);
  const existingInstitute = await Institute.findById(instituteId);

  if (!existingInstitute) {
    await Institute.create({
      _id: instituteId,
      name: env.seedAdminInstituteName.trim(),
      slug: env.seedAdminInstituteName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      contactEmail: env.seedAdminEmail.trim().toLowerCase(),
      plan: 'free',
    });
    logger.info({ instituteId: env.seedAdminInstituteId }, 'Seed institute created');
  } else {
    logger.info({ instituteId: env.seedAdminInstituteId }, 'Seed institute already exists; no changes made');
  }

  const email = env.seedAdminEmail.trim().toLowerCase();
  const existingAdmin = await User.findOne({ instituteId, email, isDeleted: false });

  if (existingAdmin) {
    logger.info({ email }, 'Admin user already exists; no changes made');
    return;
  }

  await User.create({
    instituteId,
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
