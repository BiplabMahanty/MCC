const { z } = require('zod');

const { objectId, paginationFields } = require('./common.validators');

const timeString = z
  .string()
  .regex(/^\d{2}:\d{2}$/, 'Use HH:MM format.')
  .refine((v) => {
    const [h, m] = v.split(':').map(Number);
    return h >= 0 && h <= 23 && m >= 0 && m <= 59;
  }, 'Invalid time value.');

const scheduleCreateSchema = z
  .object({
    batchId: objectId,
    subjectId: objectId,
    teacherId: objectId,
    dayOfWeek: z.coerce.number().int().min(0).max(6),
    startTime: timeString,
    endTime: timeString,
    room: z.string().trim().max(60).default(''),
    isActive: z.boolean().default(true),
  })
  .strict()
  .refine((d) => d.endTime > d.startTime, {
    path: ['endTime'],
    message: 'End time must be after start time.',
  });

const scheduleUpdateSchema = z
  .object({
    batchId: objectId.optional(),
    subjectId: objectId.optional(),
    teacherId: objectId.optional(),
    dayOfWeek: z.coerce.number().int().min(0).max(6).optional(),
    startTime: timeString.optional(),
    endTime: timeString.optional(),
    room: z.string().trim().max(60).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

const scheduleListQuerySchema = z
  .object({
    ...paginationFields,
    batchId: objectId.optional(),
    dayOfWeek: z.coerce.number().int().min(0).max(6).optional(),
  })
  .strict();

module.exports = {
  scheduleCreateSchema,
  scheduleUpdateSchema,
  scheduleListQuerySchema,
};
