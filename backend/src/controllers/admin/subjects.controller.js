const subjectsService = require('../../services/admin/subjects.service');
const createCrudController = require('./createCrudController');

module.exports = createCrudController(subjectsService);
