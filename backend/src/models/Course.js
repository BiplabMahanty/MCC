const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
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

courseSchema.index(
  { instituteId: 1, code: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);
courseSchema.index({ instituteId: 1, isDeleted: 1, isActive: 1, name: 1 });

module.exports = mongoose.model('Course', courseSchema);
