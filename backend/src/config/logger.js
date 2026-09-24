const pino = require('pino');

const env = require('./env');

const transport =
  env.nodeEnv === 'development'
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'SYS:standard',
        },
      }
    : undefined;

const logger = pino({
  enabled: !env.isTest,
  level: env.logLevel,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'token',
    ],
    censor: '[REDACTED]',
  },
  transport,
});

module.exports = logger;
