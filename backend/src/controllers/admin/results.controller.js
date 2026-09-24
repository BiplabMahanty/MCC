const asyncHandler = require('../../utils/asyncHandler');
const resultService = require('../../services/exam/result.service');
const validate = require('../../middleware/validate');
const { idParamsSchema } = require('../../validators/admin/common.validators');
const { z } = require('zod');

const pageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const listResults = [
  validate(idParamsSchema, 'params'),
  validate(pageQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const data = await resultService.listExamResults(
      req.params.id,
      req.user.instituteId,
      req.query,
    );
    res.json(data);
  }),
];

const publishResults = [
  validate(idParamsSchema, 'params'),
  asyncHandler(async (req, res) => {
    const data = await resultService.publishResults(
      req.params.id,
      req.user.instituteId,
      req.user._id,
    );
    res.json({ data });
  }),
];

const unpublishResults = [
  validate(idParamsSchema, 'params'),
  asyncHandler(async (req, res) => {
    await resultService.unpublishResults(req.params.id, req.user.instituteId);
    res.status(204).end();
  }),
];

module.exports = { listResults, publishResults, unpublishResults };
