const asyncHandler = require('../../utils/asyncHandler');
const analyticsService = require('../../services/exam/analytics.service');
const resultService = require('../../services/exam/result.service');
const validate = require('../../middleware/validate');
const { idParamsSchema } = require('../../validators/admin/common.validators');
const { z } = require('zod');

const pageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const getMonitor = [
  validate(idParamsSchema, 'params'),
  asyncHandler(async (req, res) => {
    const data = await analyticsService.getExamMonitor(
      req.user._id,
      req.user.instituteId,
      req.params.id,
    );
    res.json({ data });
  }),
];

const getAnalytics = [
  validate(idParamsSchema, 'params'),
  asyncHandler(async (req, res) => {
    const data = await analyticsService.getExamAnalytics(
      req.user._id,
      req.user.instituteId,
      req.params.id,
    );
    res.json({ data });
  }),
];

const listResults = [
  validate(idParamsSchema, 'params'),
  validate(pageQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const data = await resultService.listTeacherExamResults(
      req.params.id,
      req.user.instituteId,
      req.query,
    );
    res.json(data);
  }),
];

module.exports = { getAnalytics, getMonitor, listResults };
