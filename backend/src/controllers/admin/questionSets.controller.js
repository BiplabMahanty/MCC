const asyncHandler = require('../../utils/asyncHandler');
const questionSetsService = require('../../services/admin/questionSets.service');
const validate = require('../../middleware/validate');
const {
  questionSetCreateSchema,
  questionSetListQuerySchema,
  questionSetUpdateSchema,
} = require('../../validators/questionSet.validators');
const { idParamsSchema } = require('../../validators/admin/common.validators');

const list = [
  validate(questionSetListQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const result = await questionSetsService.list(
      req.user.instituteId,
      req.query,
    );
    res.json(result);
  }),
];

const getById = [
  validate(idParamsSchema, 'params'),
  asyncHandler(async (req, res) => {
    const data = await questionSetsService.getById(
      req.user.instituteId,
      req.params.id,
    );
    res.json({ data });
  }),
];

const create = [
  validate(questionSetCreateSchema),
  asyncHandler(async (req, res) => {
    const data = await questionSetsService.create(
      req.user.instituteId,
      req.user._id,
      req.body,
    );
    res.status(201).json({ data });
  }),
];

const update = [
  validate(idParamsSchema, 'params'),
  validate(questionSetUpdateSchema),
  asyncHandler(async (req, res) => {
    const data = await questionSetsService.update(
      req.user.instituteId,
      req.user._id,
      req.params.id,
      req.body,
    );
    res.json({ data });
  }),
];

const remove = [
  validate(idParamsSchema, 'params'),
  asyncHandler(async (req, res) => {
    await questionSetsService.remove(
      req.user.instituteId,
      req.user._id,
      req.params.id,
    );
    res.status(204).send();
  }),
];

module.exports = { create, getById, list, remove, update };
