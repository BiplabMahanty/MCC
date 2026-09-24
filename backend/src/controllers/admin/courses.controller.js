const coursesService = require('../../services/admin/courses.service');
const createCrudController = require('./createCrudController');

module.exports = createCrudController(coursesService);
