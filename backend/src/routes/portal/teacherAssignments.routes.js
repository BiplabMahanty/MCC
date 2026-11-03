const express = require('express');
const { z } = require('zod');

const controller = require('../../controllers/portal/teacherAssignments.controller');
const validate = require('../../middleware/validate');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

const assignmentSchema = z.object({
  title: z.string().min(1).max(180),
  description: z.string().max(4000).optional(),
  batchId: z.string().regex(/^[a-f\d]{24}$/i),
  subjectId: z.string().regex(/^[a-f\d]{24}$/i),
  dueAt: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
});

const idSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i),
});

router.get('/', asyncHandler(controller.listAssignments));
router.post('/', validate(assignmentSchema), asyncHandler(controller.createAssignment));
router.get('/:id', validate(idSchema, 'params'), asyncHandler(controller.getAssignment));
router.patch('/:id', validate(idSchema, 'params'), validate(assignmentSchema.partial()), asyncHandler(controller.updateAssignment));
router.delete('/:id', validate(idSchema, 'params'), asyncHandler(controller.deleteAssignment));

module.exports = router;
