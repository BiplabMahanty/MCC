const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const env = require('../config/env');
const connection = new IORedis(env.redisUrl, { maxRetriesPerRequest: null, enableReadyCheck: false, lazyConnect: true });
const notificationQueue = new Queue('notifications', { connection, defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: 100, removeOnFail: 500 } });
async function queueNotification(payload) { return notificationQueue.add('deliver', payload); }
module.exports = { notificationQueue, queueNotification };
