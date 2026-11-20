const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const env = require('../config/env');

const connection = new IORedis(env.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
  // Upstash and other managed Redis providers can close idle connections.
  // Let ioredis reconnect instead of leaving BullMQ with a closed client.
  retryStrategy(retries) {
    return Math.min(Math.max(retries, 1) * 200, 2000);
  },
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
  let lastError;

  // waitUntilReady prevents a request from racing a Redis reconnect. Retry
  // once because a managed Redis connection may close between the readiness
  // check and the queue write.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await examQueue.waitUntilReady();
      const job = await examQueue.add(
        'auto-submit',
        { attemptId: String(attemptId) },
        { delay: delayMs, jobId: attemptJobId(attemptId) },
      );
      return job.id;
    } catch (error) {
      lastError = error;
      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }
  }

  throw lastError;
}

async function cancelAutoSubmit(attemptId) {
  const job = await examQueue.getJob(attemptJobId(attemptId));
  if (job) await job.remove();
}

module.exports = { cancelAutoSubmit, examQueue, scheduleAutoSubmit };
