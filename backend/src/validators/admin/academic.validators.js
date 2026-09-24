const { z } = require('zod');

const { dateOnly, objectId, paginationFields } = require('./common.validators');

const code = z
  .string()
  .trim()
  .min(1)
  .max(30)
  .transform((value) => value.toUpperCase());
const teacherIds = z
  .array(objectId)
  .max(50)
  .refine((values) => new Set(values).size === values.length, {
    message: 'Teacher identifiers must be unique.',
  })
  .default([]);

const courseCreateSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    code,
    description: z.string().trim().max(1000).default(''),
    isActive: z.boolean().default(true),
  })
  .strict();

const courseUpdateSchema = courseCreateSchema.partial().strict();

const batchCreateSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    code,
    courseId: objectId,
    teacherIds,
    academicSession: z.string().trim().min(2).max(30),
    startDate: dateOnly,
    endDate: dateOnly,
    capacity: z.coerce.number().int().min(1).max(10000).default(100),
    isActive: z.boolean().default(true),
  })
  .strict()
  .refine((data) => data.endDate >= data.startDate, {
    path: ['endDate'],
    message: 'End date must be on or after start date.',
  });

const batchUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    code: code.optional(),
    courseId: objectId.optional(),
    teacherIds: teacherIds.optional(),
    academicSession: z.string().trim().min(2).max(30).optional(),
    startDate: dateOnly.optional(),
    endDate: dateOnly.optional(),
    capacity: z.coerce.number().int().min(1).max(10000).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

const subjectCreateSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    code,
    courseId: objectId,
    teacherIds,
    description: z.string().trim().max(1000).default(''),
    isActive: z.boolean().default(true),
  })
  .strict();

const subjectUpdateSchema = subjectCreateSchema.partial().strict();

const academicListQuerySchema = z
  .object({
    ...paginationFields,
    courseId: objectId.optional(),
  })
  .strict();

module.exports = {
  academicListQuerySchema,
  batchCreateSchema,
  batchUpdateSchema,
  courseCreateSchema,
  courseUpdateSchema,
  subjectCreateSchema,
  subjectUpdateSchema,
};
