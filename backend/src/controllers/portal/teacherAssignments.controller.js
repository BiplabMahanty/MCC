const assignmentService = require('../../services/portal/teacherAssignments.service');

async function listAssignments(req, res) {
  const data = await assignmentService.listAssignments(req.user._id, req.user.instituteId);
  res.status(200).json({ data });
}

async function createAssignment(req, res) {
  const data = await assignmentService.createAssignment(req.user._id, req.user.instituteId, req.body);
  res.status(201).json({ data });
}

async function getAssignment(req, res) {
  const data = await assignmentService.getAssignment(req.user._id, req.user.instituteId, req.params.id);
  res.status(200).json({ data });
}

async function updateAssignment(req, res) {
  const data = await assignmentService.updateAssignment(req.user._id, req.user.instituteId, req.params.id, req.body);
  res.status(200).json({ data });
}

async function deleteAssignment(req, res) {
  await assignmentService.deleteAssignment(req.user._id, req.user.instituteId, req.params.id);
  res.status(204).send();
}

module.exports = {
  listAssignments,
  createAssignment,
  getAssignment,
  updateAssignment,
  deleteAssignment,
};
