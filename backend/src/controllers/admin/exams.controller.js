const asyncHandler = require('../../utils/asyncHandler');
const examsService = require('../../services/admin/exams.service');
const validate = require('../../middleware/validate');
const {
  examCreateSchema,
  examListQuerySchema,
  examUpdateSchema,
} = require('../../validators/exam.validators');
const { idParamsSchema } = require('../../validators/admin/common.validators');

const list = [
  validate(examListQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const result = await examsService.list(req.user.instituteId, req.query);
    res.json(result);
  }),
];

const getById = [
  validate(idParamsSchema, 'params'),
  asyncHandler(async (req, res) => {
    const data = await examsService.getById(
      req.user.instituteId,
      req.params.id,
    );
    res.json({ data });
  }),
];

const create = [
  validate(examCreateSchema),
  asyncHandler(async (req, res) => {
    const data = await examsService.create(
      req.user.instituteId,
      req.user._id,
      req.body,
    );
    res.status(201).json({ data });
  }),
];

const update = [
  validate(idParamsSchema, 'params'),
  validate(examUpdateSchema),
  asyncHandler(async (req, res) => {
    const data = await examsService.update(
      req.user.instituteId,
      req.user._id,
      req.params.id,
      req.body,
    );
    res.json({ data });
  }),
];

const publish = [
  validate(idParamsSchema, 'params'),
  asyncHandler(async (req, res) => {
    const data = await examsService.publish(
      req.user.instituteId,
      req.user._id,
      req.params.id,
    );
    res.json({ data });
  }),
];

const unpublish = [
  validate(idParamsSchema, 'params'),
  asyncHandler(async (req, res) => {
    const data = await examsService.unpublish(
      req.user.instituteId,
      req.user._id,
      req.params.id,
    );
    res.json({ data });
  }),
];

const remove = [
  validate(idParamsSchema, 'params'),
  asyncHandler(async (req, res) => {
    await examsService.remove(
      req.user.instituteId,
      req.user._id,
      req.params.id,
    );
    res.status(204).send();
  }),
];

module.exports = { create, getById, list, publish, remove, unpublish, update };
