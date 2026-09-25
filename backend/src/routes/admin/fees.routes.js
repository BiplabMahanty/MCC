const express = require('express');
const { z } = require('zod');
const controller = require('../../controllers/fees.controller');
const validate = require('../../middleware/validate');
const asyncHandler = require('../../utils/asyncHandler');
const router = express.Router();
const id = z.string().regex(/^[a-f\d]{24}$/i);
router.post('/payments', validate(z.object({ feePlanId: id, studentId: id, amount: z.coerce.number().positive(), paidAt: z.coerce.date(), method: z.enum(['cash', 'upi', 'card', 'bank_transfer', 'other']), reference: z.string().max(100).optional(), note: z.string().max(1000).optional() })), asyncHandler(controller.record));
module.exports = router;
