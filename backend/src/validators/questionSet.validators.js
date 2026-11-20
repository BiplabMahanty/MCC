const { z } = require('zod');

const { objectId, paginationFields } = require('./admin/common.validators');

const questionSetFields = {
  name: z.string().trim().min(2).max(200),
  description: z.string().trim().max(1000).default(''),
  subjectId: objectId,
  questionIds: z.array(objectId).min(1).max(200),
  isActive: z.boolean().default(true),
};

const questionSetCreateSchema = z
  .object(questionSetFields)
  .strict();

const questionSetUpdateSchema = z
  .object(questionSetFields)
  .partial()
  .strict();

const questionSetListQuerySchema = z
  .object({
    ...paginationFields,
    subjectId: objectId.optional(),
    chapterId: objectId.optional(),
    search: z.string().trim().optional(),
  })
  .strict();

module.exports = {
  questionSetCreateSchema,
  questionSetUpdateSchema,
  questionSetListQuerySchema,
};
