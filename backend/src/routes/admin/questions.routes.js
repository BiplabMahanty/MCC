const express = require('express');

const questionsController = require('../../controllers/questions.controller');
const validate = require('../../middleware/validate');
const asyncHandler = require('../../utils/asyncHandler');
const { idParamsSchema } = require('../../validators/admin/common.validators');
const {
  questionCreateSchema,
  questionListQuerySchema,
  questionUpdateSchema,
} = require('../../validators/questions.validators');

const router = express.Router();

router
  .route('/')
  .get(
    validate(questionListQuerySchema, 'query'),
    asyncHandler(questionsController.listAdmin),
  )
  .post(
    validate(questionCreateSchema),
    asyncHandler(questionsController.create),
  );

router
  .route('/:id')
  .get(
    validate(idParamsSchema, 'params'),
    asyncHandler(questionsController.getAdmin),
  )
  .patch(
    validate(idParamsSchema, 'params'),
    validate(questionUpdateSchema),
    asyncHandler(questionsController.update),
  )
  .delete(
    validate(idParamsSchema, 'params'),
    asyncHandler(questionsController.remove),
  );

module.exports = router;
