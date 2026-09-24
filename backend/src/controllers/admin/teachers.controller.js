const teachersService = require('../../services/admin/teachers.service');
const createCrudController = require('./createCrudController');

module.exports = createCrudController(teachersService);
