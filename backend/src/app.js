const { randomUUID } = require('node:crypto');

const cors = require('cors');
const express = require('express');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const pinoHttp = require('pino-http');

const env = require('./config/env');
const logger = require('./config/logger');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const apiRateLimiter = require('./middleware/rateLimiter');
const routes = require('./routes');

const app = express();

const allowedOrigins = env.corsOrigin
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (
      !origin ||
      allowedOrigins.includes('*') ||
      allowedOrigins.includes(origin)
    ) {
      callback(null, true);
      return;
    }

    const error = new Error('Origin is not allowed by CORS.');
    error.statusCode = 403;
    callback(error);
  },
};

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(
  pinoHttp({
    logger,
    genReqId(req, res) {
      const requestId = req.headers['x-request-id'] || randomUUID();
      res.setHeader('x-request-id', requestId);
      return requestId;
    },
  }),
);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    referrerPolicy: { policy: 'no-referrer' },
  }),
);
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(mongoSanitize());
app.use('/api', apiRateLimiter, routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
