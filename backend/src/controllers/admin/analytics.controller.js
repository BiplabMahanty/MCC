const analyticsService = require('../../services/admin/analytics.service');

async function getAnalytics(req, res) {
  const data = await analyticsService.getAnalytics(
    req.user.instituteId,
    req.query,
  );
  res.json({ data });
}

module.exports = { getAnalytics };
