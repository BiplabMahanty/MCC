const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid identifier.');
const optionalBooleanQuery = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true')
  .optional();

const idParamsSchema = z.object({ id: objectId }).strict();

const paginationFields = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
  isActive: optionalBooleanQuery,
};

const listQuerySchema = z.object(paginationFields).strict();

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format.')
  .refine(
    (value) => !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)),
    'Enter a valid date.',
  );

module.exports = {
  dateOnly,
  idParamsSchema,
  listQuerySchema,
  objectId,
  paginationFields,
};
