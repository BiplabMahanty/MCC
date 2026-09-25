const express = require('express');
const controller = require('../controllers/attendance.controller');
const validate = require('../middleware/validate');
const { attendanceQuerySchema, markAttendanceSchema } = require('../validators/attendance.validators');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', validate(attendanceQuerySchema, 'query'), asyncHandler(controller.list));
router.put('/', validate(markAttendanceSchema), asyncHandler(controller.mark));

module.exports = router;
