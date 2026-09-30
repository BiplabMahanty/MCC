const express = require('express');

const uploadsController = require('../../controllers/uploads.controller');
const validate = require('../../middleware/validate');
const asyncHandler = require('../../utils/asyncHandler');
const {
  profileUploadRequestSchema,
  uploadRequestSchema,
} = require('../../validators/questions.validators');

const router = express.Router();

router.post(
  '/question-image',
  validate(uploadRequestSchema),
  asyncHandler(uploadsController.createQuestionImageUpload),
);

router.post(
  '/profile-image',
  validate(profileUploadRequestSchema),
  asyncHandler(uploadsController.createProfileImageUpload),
);

module.exports = router;
