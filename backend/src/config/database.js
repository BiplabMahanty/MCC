const mongoose = require('mongoose');

const env = require('./env');
const logger = require('./logger');

mongoose.set('strictQuery', true);

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  logger.error({ err: error }, 'MongoDB connection error');
});

async function connectMongo() {
  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: env.connectionTimeoutMs,
  });
  logger.info('MongoDB connected');
}

async function disconnectMongo() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = {
  connectMongo,
  disconnectMongo,
};
