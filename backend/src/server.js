const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = require('./app');
const { connectMongo, disconnectMongo } = require('./config/database');
const env = require('./config/env');
const logger = require('./config/logger');
const { connectRedis, disconnectRedis } = require('./config/redis');
// Start BullMQ worker for exam auto-submit
require('./workers/examWorker');

let server;
let shuttingDown = false;

async function connectInfrastructure() {
  const results = await Promise.allSettled([connectMongo(), connectRedis()]);
  const names = ['MongoDB', 'Redis'];

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      logger.error(
        { err: result.reason, service: names[index] },
        'Infrastructure connection failed',
      );
    }
  });
}

async function shutdown(signal) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  logger.info({ signal }, 'Graceful shutdown started');

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  await Promise.allSettled([disconnectMongo(), disconnectRedis()]);
  logger.info('Graceful shutdown complete');
  process.exit(0);
}

async function start() {
  await connectInfrastructure();

  server = app.listen(env.port, '0.0.0.0', (error) => {
    if (error) {
      logger.fatal({ err: error }, 'Unable to start API server');
      process.exit(1);
    }

    logger.info({ port: env.port }, 'API server listening');
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (error) => {
  logger.error({ err: error }, 'Unhandled promise rejection');
});
process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Uncaught exception');
  process.exit(1);
});

start().catch((error) => {
  logger.fatal({ err: error }, 'Backend startup failed');
  process.exit(1);
});
