const controller = require('../../controllers/admin/chapters.controller');
const {
  academicListQuerySchema,
  chapterCreateSchema,
  chapterUpdateSchema,
} = require('../../validators/admin/academic.validators');
const createCrudRouter = require('./createCrudRouter');

module.exports = createCrudRouter({
  controller,
  createSchema: chapterCreateSchema,
  updateSchema: chapterUpdateSchema,
  listSchema: academicListQuerySchema,
});
