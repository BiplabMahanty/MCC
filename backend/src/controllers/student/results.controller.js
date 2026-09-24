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
  validate(pageQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const data = await resultService.listStudentResults(
      req.user._id,
      req.user.instituteId,
      req.query,
    );
    res.json(data);
  }),
];

const getResult = [
  validate(idParamsSchema, 'params'),
  asyncHandler(async (req, res) => {
    const data = await resultService.getStudentResult(
      req.user._id,
      req.user.instituteId,
      req.params.id,
    );
    res.json({ data });
  }),
];

module.exports = { getResult, listResults };
