const express = require('express');

const adminRoutes = require('./admin');
const authRoutes = require('./auth.routes');
const healthRoutes = require('./health.routes');
const instituteRoutes = require('./institute.routes');
const studentPortalRoutes = require('./portal/student.routes');
const teacherPortalRoutes = require('./portal/teacher.routes');
const notificationsRoutes = require('./notifications.routes');
const reportsRoutes = require('./reports.routes');

const router = express.Router();

router.use('/admin', adminRoutes);
router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/institutes', instituteRoutes);
router.use('/student', studentPortalRoutes);
router.use('/teacher', teacherPortalRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/reports', reportsRoutes);

module.exports = router;
