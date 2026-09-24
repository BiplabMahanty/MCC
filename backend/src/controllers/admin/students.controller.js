const studentsService = require('../../services/admin/students.service');
const createCrudController = require('./createCrudController');

module.exports = createCrudController(studentsService);
