const express = require('express');

const validate = require('../../middleware/validate');
const asyncHandler = require('../../utils/asyncHandler');
const { idParamsSchema } = require('../../validators/admin/common.validators');

function createCrudRouter({
  controller,
  createSchema,
  updateSchema,
  listSchema,
}) {
  const router = express.Router();

  router
    .route('/')
    .get(validate(listSchema, 'query'), asyncHandler(controller.list))
    .post(validate(createSchema), asyncHandler(controller.create));

  router
    .route('/:id')
    .get(validate(idParamsSchema, 'params'), asyncHandler(controller.getById))
    .patch(
      validate(idParamsSchema, 'params'),
      validate(updateSchema),
      asyncHandler(controller.update),
    )
    .delete(
      validate(idParamsSchema, 'params'),
      asyncHandler(controller.remove),
    );

  return router;
}

module.exports = createCrudRouter;
