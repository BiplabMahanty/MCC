const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    instituteId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    feePlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeePlan', required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    paidAt: { type: Date, required: true },
    method: { type: String, enum: ['cash', 'upi', 'card', 'bank_transfer', 'other'], required: true },
    reference: { type: String, trim: true, maxlength: 100, default: '' },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiptNumber: { type: String, required: true, trim: true },
    note: { type: String, trim: true, maxlength: 1000, default: '' },
  },
  { timestamps: true },
);
paymentSchema.index({ instituteId: 1, receiptNumber: 1 }, { unique: true });
paymentSchema.index({ instituteId: 1, studentId: 1, paidAt: -1 });
paymentSchema.index({ instituteId: 1, feePlanId: 1, studentId: 1 });
module.exports = mongoose.model('Payment', paymentSchema);
