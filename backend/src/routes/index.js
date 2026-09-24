const express = require('express');

const adminRoutes = require('./admin');
const authRoutes = require('./auth.routes');
const healthRoutes = require('./health.routes');
const studentPortalRoutes = require('./portal/student.routes');
const teacherPortalRoutes = require('./portal/teacher.routes');

const router = express.Router();

router.use('/admin', adminRoutes);
router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/student', studentPortalRoutes);
router.use('/teacher', teacherPortalRoutes);

module.exports = router;
