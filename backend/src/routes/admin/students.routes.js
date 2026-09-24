const controller = require('../../controllers/admin/students.controller');
const {
  peopleListQuerySchema,
  studentCreateSchema,
  studentUpdateSchema,
} = require('../../validators/admin/people.validators');
const createCrudRouter = require('./createCrudRouter');

module.exports = createCrudRouter({
  controller,
  createSchema: studentCreateSchema,
  updateSchema: studentUpdateSchema,
  listSchema: peopleListQuerySchema,
});
