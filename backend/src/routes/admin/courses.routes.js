const controller = require('../../controllers/admin/courses.controller');
const {
  courseCreateSchema,
  courseUpdateSchema,
} = require('../../validators/admin/academic.validators');
const { listQuerySchema } = require('../../validators/admin/common.validators');
const createCrudRouter = require('./createCrudRouter');

module.exports = createCrudRouter({
  controller,
  createSchema: courseCreateSchema,
  updateSchema: courseUpdateSchema,
  listSchema: listQuerySchema,
});
