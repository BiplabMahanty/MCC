const express = require('express');
const controller = require('../../controllers/student/results.controller');

const router = express.Router();

router.get('/results', controller.listResults);
router.get('/results/:id', controller.getResult);

module.exports = router;
