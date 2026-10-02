const controller = require('../../controllers/admin/schedule.controller');
const {
  scheduleCreateSchema,
  scheduleUpdateSchema,
  scheduleListQuerySchema,
} = require('../../validators/admin/schedule.validators');
const createCrudRouter = require('./createCrudRouter');

module.exports = createCrudRouter({
  controller,
  createSchema: scheduleCreateSchema,
  updateSchema: scheduleUpdateSchema,
  listSchema: scheduleListQuerySchema,
});
