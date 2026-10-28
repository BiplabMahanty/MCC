const dashboardService = require('../../services/admin/dashboard.service');

async function getDashboard(req, res) {
  const data = await dashboardService.getDashboard(req.user.instituteId);
  res.status(200).json({ data });
}

async function getDashboardHome(req, res) {
  const data = await dashboardService.getDashboardHome(req.user.instituteId, req.user._id);
  res.status(200).json({ data });
}

module.exports = {
  getDashboard,
  getDashboardHome,
};
