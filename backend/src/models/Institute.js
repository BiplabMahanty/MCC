const mongoose = require('mongoose');

const instituteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 60,
      match: /^[a-z0-9-]+$/,
    },
    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    contactPhone: {
      type: String,
      trim: true,
      maxlength: 20,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
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
  {
    timestamps: true,
    toJSON: {
      transform(doc, result) {
        delete result.isDeleted;
        delete result.deletedAt;
        delete result.__v;
        return result;
      },
    },
  },
);

instituteSchema.index(
  { slug: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);

module.exports = mongoose.model('Institute', instituteSchema);
