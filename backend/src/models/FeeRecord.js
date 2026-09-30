const mongoose = require('mongoose');

const feeRecordSchema = new mongoose.Schema(
  {
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true, index: true },
    feePlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeePlan', required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // installment label e.g. "January 2025", "1st Installment"
    label: { type: String, required: true, trim: true, maxlength: 120 },
    amount: { type: Number, required: true, min: 0.01 },
    dueDate: { type: Date, required: true },
    paidAmount: { type: Number, default: 0, min: 0 },
    // pending | paid | partial | waived | overdue
    status: {
      type: String,
      enum: ['pending', 'paid', 'partial', 'waived', 'overdue'],
      default: 'pending',
    },
    waivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    waivedAt: { type: Date, default: null },
    waivedNote: { type: String, default: '', maxlength: 500 },
  },
  { timestamps: true },
);

feeRecordSchema.index({ instituteId: 1, studentId: 1, dueDate: 1 });
feeRecordSchema.index({ instituteId: 1, feePlanId: 1, studentId: 1 });
feeRecordSchema.index({ instituteId: 1, status: 1, dueDate: 1 });

module.exports = mongoose.model('FeeRecord', feeRecordSchema);
