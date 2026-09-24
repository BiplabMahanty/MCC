const express = require('express');

const studentController = require('../../controllers/portal/student.controller');
const { ROLES } = require('../../constants/roles');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const asyncHandler = require('../../utils/asyncHandler');

const studentAttemptRoutes = require('../student/attempt.routes');
const studentResultsRoutes = require('../student/results.routes');

const router = express.Router();

router.use(authenticate, authorize(ROLES.STUDENT));
router.get('/dashboard', asyncHandler(studentController.getDashboard));
router.get('/profile', asyncHandler(studentController.getProfile));
router.get('/batch', asyncHandler(studentController.getBatch));
router.get('/subjects', asyncHandler(studentController.getSubjects));
router.get('/teachers', asyncHandler(studentController.getTeachers));
router.use('/', studentAttemptRoutes);
router.use('/', studentResultsRoutes);

module.exports = router;
