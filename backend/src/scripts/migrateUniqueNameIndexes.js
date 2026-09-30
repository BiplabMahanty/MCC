const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const { connectMongo, disconnectMongo } = require('../config/database');
const logger = require('../config/logger');
const Course = require('../models/Course');
const Batch = require('../models/Batch');

async function run() {
  await connectMongo();

  for (const { Model, label } of [
    { Model: Course, label: 'courses' },
    { Model: Batch, label: 'batches' },
  ]) {
    const existing = await Model.collection.indexes();
    const names = existing.map((i) => i.name);
    logger.info({ label, names }, 'existing indexes');

    await Model.syncIndexes();
    logger.info({ label }, 'indexes synced');
  }
}

run()
  .catch((err) => {
    logger.fatal({ err }, 'Migration failed');
    process.exitCode = 1;
  })
  .finally(disconnectMongo);
