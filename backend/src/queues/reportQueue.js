const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const env = require('../config/env');
const connection = new IORedis(env.redisUrl, { maxRetriesPerRequest: null, enableReadyCheck: false, lazyConnect: true });
const reportQueue = new Queue('reports', { connection, defaultJobOptions: { attempts: 2, backoff: { type: 'exponential', delay: 3000 }, removeOnComplete: 100, removeOnFail: 200 } });
async function queueReport(reportId) { return reportQueue.add('generate-pdf', { reportId: String(reportId) }); }
module.exports = { queueReport, reportQueue };
