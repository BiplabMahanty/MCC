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

// BullMQ custom job IDs may not contain ':'. Keep this format shared by
// scheduling and cancellation so manual submission can remove the timer.
function attemptJobId(attemptId) {
  return `attempt-${String(attemptId)}`;
}

async function scheduleAutoSubmit(attemptId, delayMs) {
  const job = await examQueue.add(
    'auto-submit',
    { attemptId: String(attemptId) },
    { delay: delayMs, jobId: attemptJobId(attemptId) },
  );
  return job.id;
}

async function cancelAutoSubmit(attemptId) {
  const job = await examQueue.getJob(attemptJobId(attemptId));
  if (job) await job.remove();
}

module.exports = { cancelAutoSubmit, examQueue, scheduleAutoSubmit };
