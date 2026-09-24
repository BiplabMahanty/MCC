const asyncHandler = require('../../utils/asyncHandler');
const attemptService = require('../../services/exam/attempt.service');
const examPortalService = require('../../services/portal/examPortal.service');
const validate = require('../../middleware/validate');
const { idParamsSchema } = require('../../validators/admin/common.validators');
const { examListQuerySchema } = require('../../validators/exam.validators');
const { z } = require('zod');

const answerSchema = z.object({
  questionIndex: z.number().int().min(0),
  selectedOptionIndex: z.number().int().min(0).nullable().default(null),
  markedForReview: z.boolean().default(false),
  visited: z.boolean().default(true),
  clientTs: z.number().default(0),
});

const syncAnswersSchema = z.object({
  answers: z.array(answerSchema).min(1).max(500),
});

const listExams = [
  validate(examListQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const result = await examPortalService.listStudentExams(
      req.user._id,
      req.user.instituteId,
      req.query,
    );
    res.json(result);
  }),
];

const getExam = [
  validate(idParamsSchema, 'params'),
  asyncHandler(async (req, res) => {
    const data = await examPortalService.getStudentExam(
      req.user._id,
      req.user.instituteId,
      req.params.id,
    );
    res.json({ data });
  }),
];

const startAttempt = [
  validate(idParamsSchema, 'params'),
  asyncHandler(async (req, res) => {
    const data = await attemptService.startAttempt(
      req.user._id,
      req.user.instituteId,
      req.params.id,
    );
    res.status(201).json(data);
  }),
];

const getAttempt = [
  validate(idParamsSchema, 'params'),
  asyncHandler(async (req, res) => {
    const data = await attemptService.getAttempt(
      req.user._id,
      req.user.instituteId,
      req.params.id,
    );
    res.json(data);
  }),
];

const syncAnswers = [
  validate(idParamsSchema, 'params'),
  validate(syncAnswersSchema),
  asyncHandler(async (req, res) => {
    const data = await attemptService.syncAnswers(
      req.user._id,
      req.params.id,
      req.body.answers,
    );
    res.json(data);
  }),
];

const submitAttempt = [
  validate(idParamsSchema, 'params'),
  asyncHandler(async (req, res) => {
    const data = await attemptService.submitAttempt(
      req.user._id,
      req.params.id,
    );
    res.json({ data });
  }),
];

module.exports = {
  getAttempt,
  getExam,
  listExams,
  startAttempt,
  submitAttempt,
  syncAnswers,
};
