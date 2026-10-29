const express = require('express');
const controller = require('../../controllers/admin/students.controller');
const {
  peopleListQuerySchema,
  studentCreateSchema,
  studentUpdateSchema,
} = require('../../validators/admin/people.validators');
const createCrudRouter = require('./createCrudRouter');
const asyncHandler = require('../../utils/asyncHandler');
const { importStudents } = require('../../services/admin/students.import.service');

const crudRouter = createCrudRouter({
  controller,
  createSchema: studentCreateSchema,
  updateSchema: studentUpdateSchema,
  listSchema: peopleListQuerySchema,
});

const router = express.Router();

// Bulk import: POST /api/admin/students/import
// Body: { students: [{ name, phone, studentCode, password, guardianName?, guardianPhone? }] }
router.post(
  '/import',
  asyncHandler(async (req, res) => {
    const rows = req.body?.students;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: 'students array is required and must not be empty' });
    }
    if (rows.length > 500) {
      return res.status(400).json({ message: 'Maximum 500 students per import' });
    }

    const result = await importStudents(req.user.instituteId, rows);

    const status = result.failed.length === 0 ? 201 : result.succeeded.length === 0 ? 400 : 207;
    return res.status(status).json({
      message: `${result.succeeded.length} imported, ${result.failed.length} failed out of ${result.total}`,
      succeeded: result.succeeded,
      failed: result.failed,
    });
  }),
);

// Mount all standard CRUD routes
router.use('/', crudRouter);

module.exports = router;
