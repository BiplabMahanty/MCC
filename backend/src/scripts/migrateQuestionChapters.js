const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const { connectMongo, disconnectMongo } = require('../config/database');
const logger = require('../config/logger');
const Chapter = require('../models/Chapter');
const Question = require('../models/Question');

async function run() {
  const apply = process.argv.includes('--apply');
  await connectMongo();

  const groups = await Question.aggregate([
    { $match: { isDeleted: false, topic: { $type: 'string', $ne: '' } } },
    { $group: { _id: { instituteId: '$instituteId', subjectId: '$subjectId', topic: '$topic' }, count: { $sum: 1 } } },
    { $sort: { '_id.instituteId': 1, '_id.subjectId': 1, '_id.topic': 1 } },
  ]);

  let assigned = 0;
  for (const group of groups) {
    const { instituteId, subjectId, topic } = group._id;
    if (!apply) {
      logger.info({ instituteId, subjectId, topic, questions: group.count }, 'would create/assign chapter');
      continue;
    }

    const chapter = await Chapter.findOneAndUpdate(
      { instituteId, subjectId, name: topic, isDeleted: false },
      { $setOnInsert: { instituteId, subjectId, name: topic, description: '', sortOrder: 0, isActive: true } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
    const result = await Question.updateMany(
      { instituteId, subjectId, topic, isDeleted: false, $or: [{ chapterId: null }, { chapterId: { $exists: false } }] },
      { $set: { chapterId: chapter._id } },
    );
    assigned += result.modifiedCount;
  }

  logger.info({ mode: apply ? 'apply' : 'dry-run', groups: groups.length, assigned }, 'question chapter migration complete');
}

run()
  .catch((err) => {
    logger.fatal({ err }, 'Question chapter migration failed');
    process.exitCode = 1;
  })
  .finally(disconnectMongo);
