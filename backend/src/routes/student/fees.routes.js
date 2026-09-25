const express = require('express');
const controller = require('../../controllers/fees.controller');
const asyncHandler = require('../../utils/asyncHandler');
const router = express.Router();
router.get('/fees', asyncHandler(controller.mine));
module.exports = router;
