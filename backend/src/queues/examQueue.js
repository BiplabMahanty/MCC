const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const env = require('../config/env');

const connection = new IORedis(env.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
});

const examQueue = new Queue('exam-auto-submit', {
  connection,
  defaultJobOptions: { removeOnComplete: 100, removeOnFail: 200 },
});

async function scheduleAutoSubmit(attemptId, delayMs) {
  const job = await examQueue.add(
    'auto-submit',
    { attemptId: String(attemptId) },
    { delay: delayMs, jobId: `attempt:${attemptId}` },
  );
  return job.id;
}

async function cancelAutoSubmit(attemptId) {
  const job = await examQueue.getJob(`attempt:${attemptId}`);
  if (job) await job.remove();
}

module.exports = { cancelAutoSubmit, examQueue, scheduleAutoSubmit };
