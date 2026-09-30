const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema(
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
    academicSession: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    capacity: {
      type: Number,
      min: 1,
      max: 10000,
      default: 100,
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

batchSchema.index(
  { instituteId: 1, code: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);
batchSchema.index(
  { courseId: 1, name: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);
batchSchema.index({ instituteId: 1, courseId: 1, isDeleted: 1, isActive: 1 });
batchSchema.index({ instituteId: 1, teacherIds: 1, isDeleted: 1, isActive: 1 });
batchSchema.index({ instituteId: 1, isDeleted: 1, name: 1 });

module.exports = mongoose.model('Batch', batchSchema);
