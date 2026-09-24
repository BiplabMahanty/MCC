const express = require('express');
const controller = require('../../controllers/admin/results.controller');

const router = express.Router({ mergeParams: true });

router.get('/', controller.listResults);
router.post('/publish', controller.publishResults);
router.post('/unpublish', controller.unpublishResults);

module.exports = router;
