const FeePlan = require('../models/FeePlan');
const Payment = require('../models/Payment');
const User = require('../models/User');
const AppError = require('../utils/AppError');

async function studentFees(studentId, instituteId) {
  const student = await User.findOne({ _id: studentId, instituteId, role: 'student', isActive: true, isDeleted: false }).select('studentProfile.batchId').lean();
  if (!student?.studentProfile?.batchId) return { plans: [], payments: [], summary: { due: 0, paid: 0, pending: 0 } };
  const [plans, payments] = await Promise.all([
    FeePlan.find({ instituteId, batchId: student.studentProfile.batchId, isActive: true }).sort({ dueDate: 1 }).lean(),
    Payment.find({ instituteId, studentId }).sort({ paidAt: -1 }).lean(),
  ]);
  const due = plans.reduce((sum, plan) => sum + plan.amount, 0);
  const paid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  return { plans, payments, summary: { due, paid, pending: Math.max(0, due - paid) } };
}

async function recordPayment(instituteId, adminId, input) {
  const plan = await FeePlan.findOne({ _id: input.feePlanId, instituteId, isActive: true }).lean();
  if (!plan) throw new AppError('Fee plan not found.', 404, 'NOT_FOUND');
  const student = await User.findOne({ _id: input.studentId, instituteId, role: 'student', 'studentProfile.batchId': plan.batchId, isActive: true, isDeleted: false }).lean();
  if (!student) throw new AppError('Student is not in this fee plan batch.', 400, 'INVALID_STUDENT');
  const receiptNumber = `R-${Date.now()}-${String(input.studentId).slice(-4)}`;
  return Payment.create({ ...input, instituteId, recordedBy: adminId, receiptNumber });
}
module.exports = { recordPayment, studentFees };
