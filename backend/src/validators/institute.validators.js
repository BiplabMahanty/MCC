const { z } = require('zod');

const { paginationFields, objectId } = require('./admin/common.validators');

const slug = z
  .string()
  .trim()
  .min(2)
  .max(60)
  .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens.')
  .transform((v) => v.toLowerCase());

const instituteCreateSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    slug,
    contactEmail: z.string().trim().email().max(254).transform((v) => v.toLowerCase()),
    contactPhone: z.string().trim().max(20).default(''),
    address: z.string().trim().max(300).default(''),
    plan: z.enum(['free', 'pro', 'enterprise']).default('free'),
    admin: z.object({
      name: z.string().trim().min(2).max(100),
      password: z.string().min(6).max(128),
    }),
  })
  .strict();

const instituteUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    slug: slug.optional(),
    contactPhone: z.string().trim().max(20).optional(),
    address: z.string().trim().max(300).optional(),
    plan: z.enum(['free', 'pro', 'enterprise']).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

const instituteListQuerySchema = z
  .object({
    ...paginationFields,
    plan: z.enum(['free', 'pro', 'enterprise']).optional(),
  })
  .strict();

const instituteIdParamsSchema = z.object({ id: objectId }).strict();

module.exports = {
  instituteCreateSchema,
  instituteUpdateSchema,
  instituteListQuerySchema,
  instituteIdParamsSchema,
};
