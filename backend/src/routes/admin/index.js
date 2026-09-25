const express = require('express');

const analyticsController = require('../../controllers/admin/analytics.controller');
const dashboardController = require('../../controllers/admin/dashboard.controller');
const { ROLES } = require('../../constants/roles');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const asyncHandler = require('../../utils/asyncHandler');
const validate = require('../../middleware/validate');
const {
  analyticsQuerySchema,
} = require('../../validators/admin/analytics.validators');
const batchesRoutes = require('./batches.routes');
const coursesRoutes = require('./courses.routes');
const examsRoutes = require('./exams.routes');
const resultsRoutes = require('./results.routes');
const questionsRoutes = require('./questions.routes');
const studentsRoutes = require('./students.routes');
const subjectsRoutes = require('./subjects.routes');
const teachersRoutes = require('./teachers.routes');
const uploadsRoutes = require('./uploads.routes');
const attendanceRoutes = require('../attendance.routes');
const feesRoutes = require('./fees.routes');

const router = express.Router();

router.use(authenticate, authorize(ROLES.ADMIN));
router.get('/dashboard', asyncHandler(dashboardController.getDashboard));
router.get(
  '/analytics',
  validate(analyticsQuerySchema, 'query'),
  asyncHandler(analyticsController.getAnalytics),
);
router.use('/students', studentsRoutes);
router.use('/teachers', teachersRoutes);
router.use('/courses', coursesRoutes);
router.use('/batches', batchesRoutes);
router.use('/subjects', subjectsRoutes);
router.use('/exams', examsRoutes);
router.use('/exams/:id/results', resultsRoutes);
router.use('/questions', questionsRoutes);
router.use('/uploads', uploadsRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/fees', feesRoutes);

module.exports = router;
