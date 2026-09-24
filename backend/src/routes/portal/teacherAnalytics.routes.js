const express = require('express');
const controller = require('../../controllers/portal/teacherAnalytics.controller');

const router = express.Router({ mergeParams: true });

router.get('/monitor', controller.getMonitor);
router.get('/results', controller.listResults);
router.get('/analytics', controller.getAnalytics);

module.exports = router;
