const batchesService = require('../../services/admin/batches.service');
const createCrudController = require('./createCrudController');

module.exports = createCrudController(batchesService);
