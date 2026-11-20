const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema(
  {
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true, index: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 160 },
    code: { type: String, trim: true, uppercase: true, maxlength: 40, default: '' },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    sortOrder: { type: Number, min: 0, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

chapterSchema.index(
  { instituteId: 1, subjectId: 1, name: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);
chapterSchema.index({ instituteId: 1, subjectId: 1, isDeleted: 1, isActive: 1, sortOrder: 1 });

module.exports = mongoose.model('Chapter', chapterSchema);
