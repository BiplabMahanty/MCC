const healthService = require('../services/health.service');

async function getHealth(req, res) {
  const health = await healthService.getHealthStatus();
  const statusCode = health.status === 'healthy' ? 200 : 503;

  res.status(statusCode).json(health);
}

module.exports = {
  getHealth,
};
