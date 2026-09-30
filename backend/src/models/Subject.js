const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institute',
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    teacherIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 30,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

subjectSchema.index(
  { instituteId: 1, code: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);
subjectSchema.index({ instituteId: 1, courseId: 1, isDeleted: 1, isActive: 1 });
subjectSchema.index({
  instituteId: 1,
  teacherIds: 1,
  isDeleted: 1,
  isActive: 1,
});
subjectSchema.index({ instituteId: 1, isDeleted: 1, name: 1 });

module.exports = mongoose.model('Subject', subjectSchema);
