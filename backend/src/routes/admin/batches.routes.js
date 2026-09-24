const controller = require('../../controllers/admin/batches.controller');
const {
  academicListQuerySchema,
  batchCreateSchema,
  batchUpdateSchema,
} = require('../../validators/admin/academic.validators');
const createCrudRouter = require('./createCrudRouter');

module.exports = createCrudRouter({
  controller,
  createSchema: batchCreateSchema,
  updateSchema: batchUpdateSchema,
  listSchema: academicListQuerySchema,
});
