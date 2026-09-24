const controller = require('../../controllers/admin/subjects.controller');
const {
  academicListQuerySchema,
  subjectCreateSchema,
  subjectUpdateSchema,
} = require('../../validators/admin/academic.validators');
const createCrudRouter = require('./createCrudRouter');

module.exports = createCrudRouter({
  controller,
  createSchema: subjectCreateSchema,
  updateSchema: subjectUpdateSchema,
  listSchema: academicListQuerySchema,
});
