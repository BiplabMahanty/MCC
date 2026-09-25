const service = require('../services/notifications.service');
async function announce(req, res) { res.status(201).json({ data: await service.announce(req.user.instituteId, req.user._id, req.body) }); }
async function mine(req, res) { res.json({ data: await service.mine(req.user._id, req.user.instituteId) }); }
async function read(req, res) { res.json({ data: await service.markRead(req.user._id, req.user.instituteId, req.params.id) }); }
module.exports = { announce, mine, read };
