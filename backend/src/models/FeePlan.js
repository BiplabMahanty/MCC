const mongoose = require('mongoose');

const installmentSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 120 },
    amount: { type: Number, required: true, min: 0.01 },
    dueDate: { type: Date, required: true },
  },
  { _id: true },
);

const feePlanSchema = new mongoose.Schema(
  {
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true, index: true },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    // one_time | monthly | quarterly | yearly | custom
    type: {
      type: String,
      enum: ['one_time', 'monthly', 'quarterly', 'yearly', 'custom'],
      required: true,
    },
    // amount per cycle — used for one_time / monthly / quarterly / yearly
    amount: { type: Number, min: 0.01, default: null },
    // for recurring types: when the plan starts and ends
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    // for custom type: explicit installment schedule
    installments: { type: [installmentSchema], default: [] },
    description: { type: String, default: '', maxlength: 1000 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

feePlanSchema.index({ instituteId: 1, batchId: 1, isDeleted: 1 });
feePlanSchema.index({ instituteId: 1, isDeleted: 1, isActive: 1 });

module.exports = mongoose.model('FeePlan', feePlanSchema);
