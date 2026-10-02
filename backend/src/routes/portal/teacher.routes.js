const express = require('express');

const teacherController = require('../../controllers/portal/teacher.controller');
const { ROLES } = require('../../constants/roles');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const asyncHandler = require('../../utils/asyncHandler');
const teacherQuestionsRoutes = require('./teacherQuestions.routes');
const teacherAnalyticsRoutes = require('./teacherAnalytics.routes');
const attendanceRoutes = require('../attendance.routes');

const router = express.Router();

router.use(authenticate, authorize(ROLES.TEACHER));
router.get('/dashboard', asyncHandler(teacherController.getDashboard));
router.get('/profile', asyncHandler(teacherController.getProfile));
router.get('/batches', asyncHandler(teacherController.getBatches));
router.get('/subjects', asyncHandler(teacherController.getSubjects));
router.get('/students', asyncHandler(teacherController.getStudents));
router.get('/schedule', asyncHandler(teacherController.getSchedule));
router.use('/questions', teacherQuestionsRoutes);
router.use('/exams', require('./teacherExams.routes'));
router.use('/exams/:id', teacherAnalyticsRoutes);
router.use('/attendance', attendanceRoutes);

module.exports = router;
