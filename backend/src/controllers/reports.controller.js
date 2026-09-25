const reports = require('../services/reports.service');
async function request(req, res) { res.status(202).json({ data: await reports.request(req.user.instituteId, req.user._id, req.body) }); }
async function list(req, res) { res.json({ data: await reports.list(req.user.instituteId, req.user._id) }); }
async function get(req, res) { res.json({ data: await reports.get(req.user.instituteId, req.user._id, req.params.id) }); }
module.exports = { get, list, request };
