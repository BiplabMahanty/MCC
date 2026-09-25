const attendanceService = require('../services/attendance.service');

async function mark(req, res) {
  const data = await attendanceService.mark(
    req.user.instituteId,
    req.user._id,
    req.body,
    req.user.role === 'teacher' ? req.user._id : null,
  );
  res.status(200).json({ data });
}

async function list(req, res) {
  const data = await attendanceService.list(
    req.user.instituteId,
    req.query,
    req.user.role === 'teacher' ? req.user._id : null,
  );
  res.json({ data });
}

async function mine(req, res) {
  const data = await attendanceService.studentSummary(
    req.user._id,
    req.user.instituteId,
    req.query,
  );
  res.json({ data });
}

module.exports = { list, mark, mine };
