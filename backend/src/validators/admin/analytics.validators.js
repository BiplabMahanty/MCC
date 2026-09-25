const { z } = require('zod');

const analyticsQuerySchema = z
  .object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .refine((value) => !value.from || !value.to || value.from <= value.to, {
    message: 'from must be before or equal to to.',
    path: ['to'],
  });

module.exports = { analyticsQuerySchema };
