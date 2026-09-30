const FeePlan = require('../models/FeePlan');
const FeeRecord = require('../models/FeeRecord');
const Payment = require('../models/Payment');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { paginationMeta, paginationWindow } = require('../utils/pagination');

// ── Installment generation helpers ───────────────────────────────────────────

function monthsBetween(start, end) {
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
}

function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Generate { label, amount, dueDate }[] from a fee plan definition.
 * one_time  → 1 record
 * monthly   → 1 per month between startDate and endDate
 * quarterly → 1 per quarter
 * yearly    → 1 per year
 * custom    → use plan.installments directly
 */
function generateInstallments(plan) {
  const { type, amount, startDate, endDate, installments } = plan;

  if (type === 'custom') {
    return installments.map((i) => ({ label: i.label, amount: i.amount, dueDate: i.dueDate }));
  }

  if (type === 'one_time') {
    return [{ label: plan.name, amount, dueDate: startDate || new Date() }];
  }

  const stepMonths = type === 'monthly' ? 1 : type === 'quarterly' ? 3 : 12;
  const total = Math.ceil(monthsBetween(startDate, endDate) / stepMonths);
  const result = [];

  for (let i = 0; i < total; i++) {
    const due = addMonths(startDate, i * stepMonths);
    if (due > endDate) break;
    let label;
    if (type === 'monthly') {
      label = `${MONTH_NAMES[due.getMonth()]} ${due.getFullYear()}`;
    } else if (type === 'quarterly') {
      const q = Math.floor(due.getMonth() / 3) + 1;
      label = `Q${q} ${due.getFullYear()}`;
    } else {
      label = `${due.getFullYear()}`;
    }
    result.push({ label, amount, dueDate: due });
  }
  return result;
}

// ── Receipt number ────────────────────────────────────────────────────────────

function makeReceiptNumber(studentId) {
  return `R-${Date.now()}-${String(studentId).slice(-4).toUpperCase()}`;
}

// ── Create fee plan + auto-generate FeeRecords for all batch students ─────────

async function createFeePlan(instituteId, adminId, input) {
  // validate batch belongs to institute
  const Batch = require('../models/Batch');
  const batch = await Batch.findOne({ _id: input.batchId, instituteId, isDeleted: false }).lean();
  if (!batch) throw new AppError('Batch not found.', 404, 'NOT_FOUND');

  const plan = await FeePlan.create({ ...input, instituteId });

  // get all active students in this batch
  const students = await User.find({
    instituteId,
    role: 'student',
    'studentProfile.batchId': plan.batchId,
    isActive: true,
    isDeleted: false,
  })
    .select('_id')
    .lean();

  if (students.length > 0) {
    const slots = generateInstallments(plan);
    const records = [];
    for (const student of students) {
      for (const slot of slots) {
        records.push({
          instituteId,
          feePlanId: plan._id,
          studentId: student._id,
          label: slot.label,
          amount: slot.amount,
          dueDate: slot.dueDate,
          paidAmount: 0,
          status: 'pending',
        });
      }
    }
    await FeeRecord.insertMany(records, { ordered: false });
  }

  return plan;
}

// ── When a new student is assigned to a batch, generate their FeeRecords ──────

async function generateRecordsForStudent(instituteId, studentId, batchId) {
  const plans = await FeePlan.find({ instituteId, batchId, isActive: true, isDeleted: false }).lean();
  if (!plans.length) return;

  const records = [];
  for (const plan of plans) {
    const slots = generateInstallments(plan);
    for (const slot of slots) {
      records.push({
        instituteId,
        feePlanId: plan._id,
        studentId,
        label: slot.label,
        amount: slot.amount,
        dueDate: slot.dueDate,
        paidAmount: 0,
        status: 'pending',
      });
    }
  }
  if (records.length) await FeeRecord.insertMany(records, { ordered: false });
}

// ── List fee plans (admin) ────────────────────────────────────────────────────

async function listFeePlans(instituteId, query) {
  const { page, limit, batchId, isActive } = query;
  const filter = { instituteId, isDeleted: false };
  if (batchId) filter.batchId = batchId;
  if (isActive !== undefined) filter.isActive = isActive;

  const { skip } = paginationWindow(page, limit);
  const [plans, total] = await Promise.all([
    FeePlan.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('batchId', 'name').lean(),
    FeePlan.countDocuments(filter),
  ]);
  return { plans, pagination: paginationMeta(page, limit, total) };
}

// ── Get single fee plan with summary ─────────────────────────────────────────

async function getFeePlan(instituteId, planId) {
  const plan = await FeePlan.findOne({ _id: planId, instituteId, isDeleted: false })
    .populate('batchId', 'name')
    .lean();
  if (!plan) throw new AppError('Fee plan not found.', 404, 'NOT_FOUND');

  const [totalRecords, paidRecords, pendingRecords, overdueRecords] = await Promise.all([
    FeeRecord.countDocuments({ feePlanId: planId, instituteId }),
    FeeRecord.countDocuments({ feePlanId: planId, instituteId, status: 'paid' }),
    FeeRecord.countDocuments({ feePlanId: planId, instituteId, status: { $in: ['pending', 'partial'] } }),
    FeeRecord.countDocuments({ feePlanId: planId, instituteId, status: 'overdue' }),
  ]);

  return { ...plan, summary: { totalRecords, paidRecords, pendingRecords, overdueRecords } };
}

// ── Update fee plan (name/description/isActive only) ─────────────────────────

async function updateFeePlan(instituteId, planId, input) {
  const plan = await FeePlan.findOneAndUpdate(
    { _id: planId, instituteId, isDeleted: false },
    { $set: input },
    { new: true },
  ).lean();
  if (!plan) throw new AppError('Fee plan not found.', 404, 'NOT_FOUND');
  return plan;
}

// ── Soft-delete fee plan ──────────────────────────────────────────────────────

async function deleteFeePlan(instituteId, planId) {
  const plan = await FeePlan.findOneAndUpdate(
    { _id: planId, instituteId, isDeleted: false },
    { $set: { isDeleted: true, deletedAt: new Date(), isActive: false } },
    { new: true },
  ).lean();
  if (!plan) throw new AppError('Fee plan not found.', 404, 'NOT_FOUND');
}

// ── List fee records for a plan (admin view) ──────────────────────────────────

async function listFeeRecords(instituteId, planId, query) {
  const plan = await FeePlan.findOne({ _id: planId, instituteId, isDeleted: false }).lean();
  if (!plan) throw new AppError('Fee plan not found.', 404, 'NOT_FOUND');

  const { page, limit, status, studentId } = query;
  const filter = { feePlanId: planId, instituteId };
  if (status) filter.status = status;
  if (studentId) filter.studentId = studentId;

  const { skip } = paginationWindow(page, limit);
  const [records, total] = await Promise.all([
    FeeRecord.find(filter)
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(limit)
      .populate('studentId', 'name email studentProfile.studentCode')
      .lean(),
    FeeRecord.countDocuments(filter),
  ]);
  return { records, pagination: paginationMeta(page, limit, total) };
}

// ── Record a payment against a FeeRecord ─────────────────────────────────────

async function recordPayment(instituteId, adminId, input) {
  const record = await FeeRecord.findOne({ _id: input.feeRecordId, instituteId }).lean();
  if (!record) throw new AppError('Fee record not found.', 404, 'NOT_FOUND');
  if (record.status === 'paid') throw new AppError('This fee record is already fully paid.', 400, 'ALREADY_PAID');
  if (record.status === 'waived') throw new AppError('This fee record has been waived.', 400, 'ALREADY_WAIVED');

  const remaining = record.amount - record.paidAmount;
  if (input.amount > remaining + 0.01) {
    throw new AppError(`Payment amount exceeds remaining balance of ${remaining}.`, 400, 'OVERPAYMENT');
  }

  const receiptNumber = makeReceiptNumber(record.studentId);
  const payment = await Payment.create({
    instituteId,
    feeRecordId: record._id,
    feePlanId: record.feePlanId,
    studentId: record.studentId,
    amount: input.amount,
    paidAt: input.paidAt,
    method: input.method,
    reference: input.reference || '',
    note: input.note || '',
    recordedBy: adminId,
    receiptNumber,
  });

  const newPaidAmount = record.paidAmount + input.amount;
  const newStatus = newPaidAmount >= record.amount - 0.01 ? 'paid' : 'partial';
  await FeeRecord.updateOne({ _id: record._id }, { $set: { paidAmount: newPaidAmount, status: newStatus } });

  return payment;
}

// ── Waive a fee record ────────────────────────────────────────────────────────

async function waiveFeeRecord(instituteId, adminId, recordId, note) {
  const record = await FeeRecord.findOne({ _id: recordId, instituteId }).lean();
  if (!record) throw new AppError('Fee record not found.', 404, 'NOT_FOUND');
  if (record.status === 'paid') throw new AppError('Cannot waive a paid record.', 400, 'ALREADY_PAID');

  return FeeRecord.findByIdAndUpdate(
    recordId,
    { $set: { status: 'waived', waivedBy: adminId, waivedAt: new Date(), waivedNote: note || '' } },
    { new: true },
  ).lean();
}

// ── Mark overdue records (called by a scheduled job or on-demand) ─────────────

async function markOverdueRecords(instituteId) {
  if (!instituteId) throw new Error('instituteId is required for markOverdueRecords');
  const now = new Date();
  const result = await FeeRecord.updateMany(
    { instituteId, status: 'pending', dueDate: { $lt: now } },
    { $set: { status: 'overdue' } },
  );
  return result.modifiedCount;
}

// ── Student fee view ──────────────────────────────────────────────────────────

async function studentFees(studentId, instituteId) {
  // mark overdue first so student sees accurate status
  await markOverdueRecords(instituteId);

  const [records, payments] = await Promise.all([
    FeeRecord.find({ studentId, instituteId })
      .sort({ dueDate: 1 })
      .populate('feePlanId', 'name type')
      .lean(),
    Payment.find({ studentId, instituteId })
      .sort({ paidAt: -1 })
      .lean(),
  ]);

  const totalDue = records.reduce((s, r) => s + r.amount, 0);
  const totalPaid = records.reduce((s, r) => s + r.paidAmount, 0);
  const pending = records.filter((r) => ['pending', 'partial', 'overdue'].includes(r.status));
  const overdue = records.filter((r) => r.status === 'overdue');

  return {
    records,
    payments,
    summary: {
      totalDue,
      totalPaid,
      balance: Math.max(0, totalDue - totalPaid),
      pendingCount: pending.length,
      overdueCount: overdue.length,
    },
  };
}

// ── Admin: student fee summary ────────────────────────────────────────────────

async function studentFeeAdmin(instituteId, studentId) {
  const student = await User.findOne({ _id: studentId, instituteId, role: 'student', isDeleted: false }).lean();
  if (!student) throw new AppError('Student not found.', 404, 'NOT_FOUND');
  return studentFees(studentId, instituteId);
}

// ── Payment history for a fee record ─────────────────────────────────────────

async function paymentsByRecord(instituteId, recordId) {
  const record = await FeeRecord.findOne({ _id: recordId, instituteId }).lean();
  if (!record) throw new AppError('Fee record not found.', 404, 'NOT_FOUND');
  const payments = await Payment.find({ feeRecordId: recordId, instituteId })
    .sort({ paidAt: -1 })
    .populate('recordedBy', 'name')
    .lean();
  return { record, payments };
}

module.exports = {
  createFeePlan,
  listFeePlans,
  getFeePlan,
  updateFeePlan,
  deleteFeePlan,
  listFeeRecords,
  recordPayment,
  waiveFeeRecord,
  markOverdueRecords,
  studentFees,
  studentFeeAdmin,
  paymentsByRecord,
  generateRecordsForStudent,
};
