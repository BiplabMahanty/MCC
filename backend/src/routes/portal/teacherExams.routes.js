const express = require('express');

const asyncHandler = require('../../utils/asyncHandler');
const examPortalService = require('../../services/portal/examPortal.service');
const validate = require('../../middleware/validate');
const { idParamsSchema } = require('../../validators/admin/common.validators');
const { examListQuerySchema } = require('../../validators/exam.validators');

const router = express.Router();

router.get(
  '/',
  validate(examListQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const result = await examPortalService.listTeacherExams(
      req.user._id,
      req.user.instituteId,
      req.query,
    );
    res.json(result);
  }),
);

router.get(
  '/:id',
  validate(idParamsSchema, 'params'),
  asyncHandler(async (req, res) => {
    const data = await examPortalService.getTeacherExam(
      req.user._id,
      req.user.instituteId,
      req.params.id,
    );
    res.json({ data });
  }),
);

module.exports = router;
