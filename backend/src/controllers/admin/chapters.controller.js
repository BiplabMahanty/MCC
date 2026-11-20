const chaptersService = require('../../services/admin/chapters.service');
const createCrudController = require('./createCrudController');

module.exports = createCrudController(chaptersService);
