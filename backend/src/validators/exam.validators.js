const { z } = require('zod');

const { objectId, paginationFields } = require('./admin/common.validators');
const { EXAM_TYPES } = require('../models/Exam');

const isoDatetime = z
  .string()
  .datetime({ message: 'Use ISO 8601 UTC datetime.' });

const examFields = {
  name: z.string().trim().min(2).max(200),
  examType: z.enum(EXAM_TYPES),
  academicSession: z.string().trim().min(1).max(30),
  batchId: objectId,
  subjectId: objectId,
  teacherIds: z.array(objectId).max(10).default([]),
  questionIds: z.array(objectId).min(1).max(200),
  durationMinutes: z.number().int().min(1).max(600),
  startTime: isoDatetime,
  endTime: isoDatetime,
  totalMarks: z.number().min(1),
  marksPerQuestion: z.number().min(0.5),
  negativeMarking: z.boolean().default(false),
  negativeMarks: z.number().min(0).default(0),
  instructions: z.string().trim().max(3000).default(''),
};

const examCreateSchema = z
  .object(examFields)
  .strict()
  .refine((d) => new Date(d.endTime) > new Date(d.startTime), {
    message: 'endTime must be after startTime.',
    path: ['endTime'],
  });

const examUpdateSchema = z
  .object(examFields)
  .partial()
  .strict()
  .refine(
    (d) =>
      !d.startTime || !d.endTime || new Date(d.endTime) > new Date(d.startTime),
    { message: 'endTime must be after startTime.', path: ['endTime'] },
  );

const examListQuerySchema = z
  .object({
    ...paginationFields,
    status: z.enum(['draft', 'published', 'cancelled']).optional(),
    batchId: objectId.optional(),
    subjectId: objectId.optional(),
  })
  .strict();

module.exports = { examCreateSchema, examListQuerySchema, examUpdateSchema };
