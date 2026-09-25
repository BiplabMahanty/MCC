const mongoose = require('mongoose');

const feePlanSchema = new mongoose.Schema(
  {
    instituteId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    description: { type: String, default: '', maxlength: 1000 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);
feePlanSchema.index({ instituteId: 1, batchId: 1, dueDate: 1 });
module.exports = mongoose.model('FeePlan', feePlanSchema);
