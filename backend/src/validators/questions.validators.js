const { z } = require('zod');
const katex = require('katex');

const { objectId, paginationFields } = require('./admin/common.validators');

const imageBlock = z
  .object({
    type: z.literal('image'),
    url: z.string().url().max(2048),
    storageKey: z.string().min(1).max(500),
    alt: z.string().trim().min(1).max(300),
    mimeType: z.enum([
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/svg+xml',
    ]),
    width: z.number().int().positive().max(10000).optional(),
    height: z.number().int().positive().max(10000).optional(),
  })
  .strict();

const textBlock = z
  .object({
    type: z.literal('text'),
    value: z.string().trim().min(1).max(5000),
  })
  .strict();

function validFormula(value) {
  try {
    katex.renderToString(value, {
      output: 'mathml',
      strict: 'error',
      throwOnError: true,
      trust: false,
    });
    return true;
  } catch {
    return false;
  }
}

const formulaBlock = z
  .object({
    type: z.literal('formula'),
    value: z
      .string()
      .trim()
      .min(1)
      .max(2000)
      .refine(validFormula, 'Enter valid LaTeX.'),
  })
  .strict();

const tableBlock = z
  .object({
    type: z.literal('table'),
    caption: z.string().trim().max(300).default(''),
    headers: z.array(z.string().trim().min(1).max(200)).min(1).max(12),
    rows: z
      .array(z.array(z.string().trim().max(500)).min(1).max(12))
      .min(1)
      .max(30),
  })
  .strict()
  .refine(
    (block) => block.rows.every((row) => row.length === block.headers.length),
    {
      message: 'Every table row must match the header column count.',
      path: ['rows'],
    },
  );

const questionBlock = z.discriminatedUnion('type', [
  textBlock,
  formulaBlock,
  imageBlock,
  tableBlock,
]);
const optionBlock = z.discriminatedUnion('type', [
  textBlock,
  formulaBlock,
  imageBlock,
]);
const option = z
  .object({ content: z.array(optionBlock).min(1).max(5) })
  .strict();

const questionFields = {
  subjectId: objectId,
  topic: z.string().trim().min(1).max(120),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  content: z.array(questionBlock).min(1).max(30),
  options: z.array(option).min(2).max(8),
  correctOptionIndex: z.number().int().min(0),
  isActive: z.boolean().default(true),
};

const questionCreateSchema = z
  .object(questionFields)
  .strict()
  .refine((question) => question.correctOptionIndex < question.options.length, {
    message: 'Correct option must reference an existing option.',
    path: ['correctOptionIndex'],
  });

const questionUpdateSchema = z.object(questionFields).partial().strict();

const questionListQuerySchema = z
  .object({
    ...paginationFields,
    subjectId: objectId.optional(),
    topic: z.string().trim().max(120).optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  })
  .strict();

const uploadRequestSchema = z
  .object({
    fileName: z.string().trim().min(1).max(255),
    mimeType: z.enum([
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/svg+xml',
    ]),
    size: z
      .number()
      .int()
      .positive()
      .max(5 * 1024 * 1024),
  })
  .strict();

const profileUploadRequestSchema = z
  .object({
    fileName: z.string().trim().min(1).max(255),
    mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
    size: z.number().int().positive().max(5 * 1024 * 1024),
  })
  .strict();

module.exports = {
  questionCreateSchema,
  questionListQuerySchema,
  questionUpdateSchema,
  uploadRequestSchema,
  profileUploadRequestSchema,
};
