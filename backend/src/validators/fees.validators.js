const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');

const installmentSchema = z.object({
  label: z.string().min(1).max(120),
  amount: z.number().positive(),
  dueDate: z.coerce.date(),
});

// ── Fee Plan ──────────────────────────────────────────────────────────────────

const createFeePlanSchema = z
  .object({
    batchId: objectId,
    name: z.string().min(1).max(120),
    type: z.enum(['one_time', 'monthly', 'quarterly', 'yearly', 'custom']),
    amount: z.number().positive().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    installments: z.array(installmentSchema).min(1).max(60).optional(),
    description: z.string().max(1000).optional(),
    isActive: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'custom') {
      if (!data.installments || data.installments.length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'installments required for custom type', path: ['installments'] });
      }
    } else {
      if (!data.amount) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'amount required for this fee type', path: ['amount'] });
      }
      if (data.type !== 'one_time') {
        if (!data.startDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'startDate required for recurring fee', path: ['startDate'] });
        if (!data.endDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'endDate required for recurring fee', path: ['endDate'] });
        if (data.startDate && data.endDate && data.endDate <= data.startDate) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'endDate must be after startDate', path: ['endDate'] });
        }
      }
    }
  });

const updateFeePlanSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(1000).optional(),
  isActive: z.boolean().optional(),
});

// ── Payment ───────────────────────────────────────────────────────────────────

const recordPaymentSchema = z.object({
  feeRecordId: objectId,
  amount: z.number().positive(),
  paidAt: z.coerce.date(),
  method: z.enum(['cash', 'upi', 'card', 'bank_transfer', 'other']),
  reference: z.string().max(100).optional(),
  note: z.string().max(1000).optional(),
});

// ── Waive ─────────────────────────────────────────────────────────────────────

const waiveRecordSchema = z.object({
  note: z.string().max(500).optional(),
});

// ── Query ─────────────────────────────────────────────────────────────────────

const feePlanQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  batchId: objectId.optional(),
  isActive: z
    .string()
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
});

const feeRecordQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['pending', 'paid', 'partial', 'waived', 'overdue']).optional(),
  studentId: objectId.optional(),
});

module.exports = {
  createFeePlanSchema,
  updateFeePlanSchema,
  recordPaymentSchema,
  waiveRecordSchema,
  feePlanQuerySchema,
  feeRecordQuerySchema,
};
