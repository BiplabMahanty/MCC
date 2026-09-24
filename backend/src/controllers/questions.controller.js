const questionsService = require('../services/questions.service');

async function listAdmin(req, res) {
  const result = await questionsService.list(req.user.instituteId, req.query);
  res.status(200).json(result);
}

async function getAdmin(req, res) {
  const data = await questionsService.getById(
    req.user.instituteId,
    req.params.id,
  );
  res.status(200).json({ data });
}

async function create(req, res) {
  const data = await questionsService.create(
    req.user.instituteId,
    req.user._id,
    req.body,
  );
  res.status(201).json({ data });
}

async function update(req, res) {
  const data = await questionsService.update(
    req.user.instituteId,
    req.user._id,
    req.params.id,
    req.body,
  );
  res.status(200).json({ data });
}

async function remove(req, res) {
  await questionsService.remove(
    req.user.instituteId,
    req.params.id,
    req.user._id,
  );
  res.status(204).send();
}

async function listTeacher(req, res) {
  const result = await questionsService.listForTeacher(
    req.user.instituteId,
    req.user._id,
    req.query,
  );
  res.status(200).json(result);
}

async function getTeacher(req, res) {
  const data = await questionsService.getForTeacher(
    req.user.instituteId,
    req.user._id,
    req.params.id,
  );
  res.status(200).json({ data });
}

module.exports = {
  create,
  getAdmin,
  getTeacher,
  listAdmin,
  listTeacher,
  remove,
  update,
};
