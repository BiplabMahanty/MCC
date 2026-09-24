const express = require('express');

const uploadsController = require('../../controllers/uploads.controller');
const validate = require('../../middleware/validate');
const asyncHandler = require('../../utils/asyncHandler');
const {
  uploadRequestSchema,
} = require('../../validators/questions.validators');

const router = express.Router();

router.post(
  '/question-image',
  validate(uploadRequestSchema),
  asyncHandler(uploadsController.createQuestionImageUpload),
);

module.exports = router;
