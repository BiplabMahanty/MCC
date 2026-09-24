const dashboardService = require('../../services/admin/dashboard.service');

async function getDashboard(req, res) {
  const data = await dashboardService.getDashboard(req.user.instituteId);
  res.status(200).json({ data });
}

module.exports = {
  getDashboard,
};
