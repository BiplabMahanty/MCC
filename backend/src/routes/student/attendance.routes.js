const express = require('express');
const controller = require('../../controllers/attendance.controller');
const validate = require('../../middleware/validate');
const { attendanceQuerySchema } = require('../../validators/attendance.validators');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();
router.get('/attendance', validate(attendanceQuerySchema, 'query'), asyncHandler(controller.mine));
module.exports = router;
