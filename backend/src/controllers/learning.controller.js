const learning = require('../services/learning.service');
async function mine(req, res) { res.json({ data: await learning.listStudent(req.user._id, req.user.instituteId) }); }
async function submit(req, res) { res.status(201).json({ data: await learning.submit(req.user._id, req.user.instituteId, req.params.id, req.body) }); }
module.exports = { mine, submit };
