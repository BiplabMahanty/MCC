const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institute',
      required: true,
      index: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6, // 0=Sun, 1=Mon, ..., 6=Sat
    },
    startTime: {
      type: String,
      required: true,
      match: /^\d{2}:\d{2}$/, // HH:MM
    },
    endTime: {
      type: String,
      required: true,
      match: /^\d{2}:\d{2}$/,
    },
    room: {
      type: String,
      trim: true,
      maxlength: 60,
      default: '',
    },
    isActive: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

scheduleSchema.index({ instituteId: 1, batchId: 1, isDeleted: 1 });
scheduleSchema.index({ instituteId: 1, teacherId: 1, isDeleted: 1 });

module.exports = mongoose.model('Schedule', scheduleSchema);
