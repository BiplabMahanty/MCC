const mongoose = require('mongoose');

const attendanceEntrySchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['present', 'absent', 'late', 'excused'], required: true },
    note: { type: String, trim: true, maxlength: 300, default: '' },
  },
  { _id: false },
);

const attendanceSchema = new mongoose.Schema(
  {
    instituteId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true, index: true },
    date: { type: Date, required: true },
    entries: { type: [attendanceEntrySchema], default: [] },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

attendanceSchema.index({ instituteId: 1, batchId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
