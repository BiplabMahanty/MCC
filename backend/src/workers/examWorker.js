const { Worker } = require('bullmq');
const IORedis = require('ioredis');

const env = require('../config/env');
const logger = require('../config/logger');
const { submitAttempt } = require('../services/exam/attempt.service');

const connection = new IORedis(env.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
});

const examWorker = new Worker(
  'exam-auto-submit',
  async (job) => {
    const { attemptId } = job.data;
    logger.info({ attemptId }, 'Auto-submitting exam attempt');

    // Find the attempt to get examId and studentId
    const ExamAttempt = require('../models/ExamAttempt');
    const attempt = await ExamAttempt.findById(attemptId).lean();

    if (!attempt) {
      logger.warn({ attemptId }, 'Attempt not found for auto-submit');
      return;
    }

    if (attempt.status !== 'in_progress') {
      logger.info(
        { attemptId },
        'Attempt already submitted, skipping auto-submit',
      );
      return;
    }

    await submitAttempt(attempt.studentId, attempt.examId, true);
    logger.info({ attemptId }, 'Auto-submit complete');
  },
  { connection, concurrency: 20 },
);

examWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'Auto-submit job failed');
});

module.exports = examWorker;
