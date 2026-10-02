const scheduleService = require('../../services/admin/schedule.service');
const createCrudController = require('./createCrudController');

module.exports = createCrudController(scheduleService);
