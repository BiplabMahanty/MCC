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

// Fee Plans
router.get('/', validate(feePlanQuerySchema, 'query'), c.listPlans);
router.post('/', validate(createFeePlanSchema), c.createPlan);
router.get('/:id', c.getPlan);
router.patch('/:id', validate(updateFeePlanSchema), c.updatePlan);
router.delete('/:id', c.deletePlan);

// Fee Records for a plan
router.get('/:id/records', validate(feeRecordQuerySchema, 'query'), c.listRecords);

// Waive a specific fee record
router.patch('/records/:recordId/waive', validate(waiveRecordSchema), c.waiveRecord);

// Payments on a specific fee record
router.get('/records/:recordId/payments', c.recordPayments);

// Record a payment
router.post('/payments', validate(recordPaymentSchema), c.recordPayment);

// Student fee summary (admin view)
router.get('/students/:studentId/fees', c.studentFeeAdmin);

// Mark overdue (can be called manually or by a cron job)
router.post('/mark-overdue', c.markOverdue);

module.exports = router;
