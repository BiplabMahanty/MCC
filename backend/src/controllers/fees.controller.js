const fees = require('../services/fees.service');
const asyncHandler = require('../utils/asyncHandler');

// ── Admin ─────────────────────────────────────────────────────────────────────

const createPlan = asyncHandler(async (req, res) => {
  const plan = await fees.createFeePlan(req.user.instituteId, req.user._id, req.body);
  res.status(201).json({ data: plan });
});

const listPlans = asyncHandler(async (req, res) => {
  const result = await fees.listFeePlans(req.user.instituteId, req.query);
  res.json(result);
});

const getPlan = asyncHandler(async (req, res) => {
  const plan = await fees.getFeePlan(req.user.instituteId, req.params.id);
  res.json({ data: plan });
});

const updatePlan = asyncHandler(async (req, res) => {
  const plan = await fees.updateFeePlan(req.user.instituteId, req.params.id, req.body);
  res.json({ data: plan });
});

const deletePlan = asyncHandler(async (req, res) => {
  await fees.deleteFeePlan(req.user.instituteId, req.params.id);
  res.sendStatus(204);
});

const listRecords = asyncHandler(async (req, res) => {
  const result = await fees.listFeeRecords(req.user.instituteId, req.params.id, req.query);
  res.json(result);
});

const recordPayment = asyncHandler(async (req, res) => {
  const payment = await fees.recordPayment(req.user.instituteId, req.user._id, req.body);
  res.status(201).json({ data: payment });
});

const waiveRecord = asyncHandler(async (req, res) => {
  const record = await fees.waiveFeeRecord(req.user.instituteId, req.user._id, req.params.recordId, req.body.note);
  res.json({ data: record });
});

const studentFeeAdmin = asyncHandler(async (req, res) => {
  const result = await fees.studentFeeAdmin(req.user.instituteId, req.params.studentId);
  res.json(result);
});

const recordPayments = asyncHandler(async (req, res) => {
  const payments = await fees.paymentsByRecord(req.user.instituteId, req.params.recordId);
  res.json(payments);
});

const markOverdue = asyncHandler(async (req, res) => {
  const count = await fees.markOverdueRecords(req.user.instituteId);
  res.json({ updated: count });
});

// ── Student ───────────────────────────────────────────────────────────────────

const myFees = asyncHandler(async (req, res) => {
  const result = await fees.studentFees(req.user._id, req.user.instituteId);
  res.json(result);
});

module.exports = {
  createPlan,
  listPlans,
  getPlan,
  updatePlan,
  deletePlan,
  listRecords,
  recordPayment,
  waiveRecord,
  studentFeeAdmin,
  recordPayments,
  markOverdue,
  myFees,
};
