const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({ name: String, url: String, storageKey: String, mimeType: String, size: Number }, { _id: false });
const submissionSchema = new mongoose.Schema({ studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, files: [fileSchema], submittedAt: Date, note: { type: String, default: '' } }, { _id: false });
const assignmentSchema = new mongoose.Schema({
  instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true, index: true },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true, index: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  description: { type: String, default: '', maxlength: 4000 },
  dueAt: { type: Date, required: true },
  attachments: { type: [fileSchema], default: [] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submissions: { type: [submissionSchema], default: [] },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
assignmentSchema.index({ instituteId: 1, batchId: 1, dueAt: 1, isDeleted: 1 });
module.exports = mongoose.model('Assignment', assignmentSchema);
