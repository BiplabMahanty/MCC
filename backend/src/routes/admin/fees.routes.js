const express = require('express');
const validate = require('../../middleware/validate');
const asyncHandler = require('../../utils/asyncHandler');
const c = require('../../controllers/fees.controller');
const {
  createFeePlanSchema,
  updateFeePlanSchema,
  recordPaymentSchema,
  waiveRecordSchema,
  feePlanQuerySchema,
  feeRecordQuerySchema,
} = require('../../validators/fees.validators');

const router = express.Router();

// Fee Plans collection
router.get('/', validate(feePlanQuerySchema, 'query'), c.listPlans);
router.post('/', validate(createFeePlanSchema), c.createPlan);

// Literal sub-paths must come before /:id
router.post('/payments', validate(recordPaymentSchema), c.recordPayment);
router.post('/mark-overdue', c.markOverdue);
router.get('/students/:studentId/fees', c.studentFeeAdmin);
router.patch('/records/:recordId/waive', validate(waiveRecordSchema), c.waiveRecord);
router.get('/records/:recordId/payments', c.recordPayments);

// Wildcard :id routes last
router.get('/:id', c.getPlan);
router.patch('/:id', validate(updateFeePlanSchema), c.updatePlan);
router.delete('/:id', c.deletePlan);
router.get('/:id/records', validate(feeRecordQuerySchema, 'query'), c.listRecords);

module.exports = router;
