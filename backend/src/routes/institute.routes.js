const express = require('express');

const env = require('../config/env');
const controller = require('../controllers/institute.controller');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validate');
const AppError = require('../utils/AppError');
const {
  instituteCreateSchema,
  instituteUpdateSchema,
  instituteListQuerySchema,
  instituteIdParamsSchema,
} = require('../validators/institute.validators');

const router = express.Router();

router.use((req, res, next) => {
  if (req.headers['x-api-key'] !== env.instituteApiKey) {
    return next(new AppError('Forbidden.', 403, 'FORBIDDEN'));
  }
  next();
});

router.get('/', validate(instituteListQuerySchema, 'query'), asyncHandler(controller.list));
router.post('/', validate(instituteCreateSchema), asyncHandler(controller.create));
router.get('/:id', validate(instituteIdParamsSchema, 'params'), asyncHandler(controller.getOne));
router.patch(
  '/:id',
  validate(instituteIdParamsSchema, 'params'),
  validate(instituteUpdateSchema),
  asyncHandler(controller.update),
);
router.delete('/:id', validate(instituteIdParamsSchema, 'params'), asyncHandler(controller.remove));

module.exports = router;
