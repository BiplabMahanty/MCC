const controller = require('../../controllers/admin/teachers.controller');
const {
  peopleListQuerySchema,
  teacherCreateSchema,
  teacherUpdateSchema,
} = require('../../validators/admin/people.validators');
const createCrudRouter = require('./createCrudRouter');

module.exports = createCrudRouter({
  controller,
  createSchema: teacherCreateSchema,
  updateSchema: teacherUpdateSchema,
  listSchema: peopleListQuerySchema,
});
