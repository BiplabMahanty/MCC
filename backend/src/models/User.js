const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const env = require('../config/env');
const { ROLES, ROLE_VALUES } = require('../constants/roles');

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { _id: false },
);

const studentProfileSchema = new mongoose.Schema(
  {
    studentCode: { type: String, trim: true, uppercase: true },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      default: null,
    },
    dateOfBirth: { type: Date, default: null },
    guardianName: { type: String, trim: true, maxlength: 100, default: '' },
    guardianPhone: { type: String, trim: true, maxlength: 20, default: '' },
  },
  { _id: false },
);

const teacherProfileSchema = new mongoose.Schema(
  {
    employeeCode: { type: String, trim: true, uppercase: true },
    qualification: { type: String, trim: true, maxlength: 150, default: '' },
    experienceYears: { type: Number, min: 0, max: 80, default: 0 },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
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
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    passwordHash: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 128,
      select: false,
    },
    role: {
      type: String,
      enum: ROLE_VALUES,
      required: true,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 20,
      default: '',
    },
    studentProfile: {
      type: studentProfileSchema,
      default: undefined,
    },
    teacherProfile: {
      type: teacherProfileSchema,
      default: undefined,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    refreshTokens: {
      type: [refreshTokenSchema],
      default: [],
      select: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
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
        delete result.passwordHash;
        delete result.refreshTokens;
        delete result.isDeleted;
        delete result.deletedAt;
        delete result.__v;
        return result;
      },
    },
  },
);

userSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: false },
  },
);
userSchema.index({ instituteId: 1, role: 1, isDeleted: 1 });
userSchema.index({ instituteId: 1, role: 1, isActive: 1, isDeleted: 1 });
userSchema.index({
  instituteId: 1,
  'studentProfile.batchId': 1,
  role: 1,
  isDeleted: 1,
});
userSchema.index(
  { instituteId: 1, 'studentProfile.studentCode': 1 },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
      role: ROLES.STUDENT,
      'studentProfile.studentCode': { $type: 'string' },
    },
  },
);
userSchema.index(
  { instituteId: 1, 'teacherProfile.employeeCode': 1 },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
      role: ROLES.TEACHER,
      'teacherProfile.employeeCode': { $type: 'string' },
    },
  },
);
userSchema.index({ 'refreshTokens.tokenHash': 1 });

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('passwordHash')) {
    return;
  }

  this.passwordHash = await bcrypt.hash(this.passwordHash, env.bcryptRounds);
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
