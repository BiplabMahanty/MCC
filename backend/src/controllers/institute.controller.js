const instituteService = require('../services/institute.service');

async function list(req, res) {
  const result = await instituteService.listInstitutes(req.query);
  res.json(result);
}

async function getOne(req, res) {
  const institute = await instituteService.getInstituteById(req.params.id);
  res.json(institute);
}

async function create(req, res) {
  const institute = await instituteService.createInstitute(req.body);
  res.status(201).json({ institute, admin: { name: req.body.admin.name, email: institute.contactEmail, role: 'admin' } });
}

async function update(req, res) {
  const institute = await instituteService.updateInstitute(req.params.id, req.body);
  res.json(institute);
}

async function remove(req, res) {
  await instituteService.deleteInstitute(req.params.id);
  res.sendStatus(204);
}

module.exports = { list, getOne, create, update, remove };
