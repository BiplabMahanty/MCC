const { z } = require('zod');

const { dateOnly, objectId, paginationFields } = require('./common.validators');

const profileImageSchema = z
  .object({
    url: z.string().url().max(2048),
    storageKey: z.string().min(1).max(500),
    mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  })
  .strict();

const commonPersonFields = {
  name: z.string().trim().min(2).max(100),
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((value) => value.toLowerCase()),
  phone: z.string().trim().max(20).default(''),
  isActive: z.boolean().default(true),
};

const studentCreateSchema = z
  .object({
    ...commonPersonFields,
    password: z.string().min(8).max(128),
    studentCode: z
      .string()
      .trim()
      .min(1)
      .max(30)
      .transform((value) => value.toUpperCase()),
    batchId: objectId.nullable().optional(),
    dateOfBirth: dateOnly.nullable().optional(),
    guardianName: z.string().trim().max(100).default(''),
    guardianPhone: z.string().trim().max(20).default(''),
    profileImage: profileImageSchema.optional(),
  })
  .strict();

const studentUpdateSchema = studentCreateSchema
  .omit({ password: true })
  .partial()
  .extend({ password: z.string().min(8).max(128).optional() })
  .strict();

const teacherCreateSchema = z
  .object({
    ...commonPersonFields,
    password: z.string().min(8).max(128),
    employeeCode: z
      .string()
      .trim()
      .min(1)
      .max(30)
      .transform((value) => value.toUpperCase()),
    qualification: z.string().trim().max(150).default(''),
    experienceYears: z.coerce.number().min(0).max(80).default(0),
    profileImage: profileImageSchema.optional(),
  })
  .strict();

const teacherUpdateSchema = teacherCreateSchema
  .omit({ password: true })
  .partial()
  .extend({ password: z.string().min(8).max(128).optional() })
  .strict();

const peopleListQuerySchema = z.object(paginationFields).strict();

module.exports = {
  peopleListQuerySchema,
  studentCreateSchema,
  studentUpdateSchema,
  teacherCreateSchema,
  teacherUpdateSchema,
};
