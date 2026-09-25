const fees = require('../services/fees.service');
async function mine(req, res) { res.json({ data: await fees.studentFees(req.user._id, req.user.instituteId) }); }
async function record(req, res) { res.status(201).json({ data: await fees.recordPayment(req.user.instituteId, req.user._id, req.body) }); }
module.exports = { mine, record };
