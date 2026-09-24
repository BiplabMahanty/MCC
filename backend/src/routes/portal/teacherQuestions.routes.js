const express = require('express');

const questionsController = require('../../controllers/questions.controller');
const validate = require('../../middleware/validate');
const asyncHandler = require('../../utils/asyncHandler');
const { idParamsSchema } = require('../../validators/admin/common.validators');
const {
  questionListQuerySchema,
} = require('../../validators/questions.validators');

const router = express.Router();

router.get(
  '/',
  validate(questionListQuerySchema, 'query'),
  asyncHandler(questionsController.listTeacher),
);
router.get(
  '/:id',
  validate(idParamsSchema, 'params'),
  asyncHandler(questionsController.getTeacher),
);

module.exports = router;
