const mongoose = require('mongoose');

const ATTEMPT_STATUSES = ['in_progress', 'submitted', 'auto_submitted'];

// Each saved answer carries a clientTs so older syncs never overwrite newer ones
const answerSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },
    selectedOptionIndex: { type: Number, default: null },
    markedForReview: { type: Boolean, default: false },
    visited: { type: Boolean, default: false },
    clientTs: { type: Number, default: 0 }, // epoch ms from client
  },
  { _id: false },
);

const examAttemptSchema = new mongoose.Schema(
  {
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institute',
      required: true,
      index: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    startedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true, index: true },
    submittedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ATTEMPT_STATUSES,
      default: 'in_progress',
      index: true,
    },
    answers: { type: [answerSchema], default: [] },
    // Populated after submission
    totalQuestions: { type: Number, default: 0 },
    attempted: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    wrong: { type: Number, default: 0 },
    unanswered: { type: Number, default: 0 },
    obtainedMarks: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    bullmqJobId: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, result) {
        delete result.__v;
        return result;
      },
    },
  },
);

// One active attempt per student per exam
examAttemptSchema.index({ examId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('ExamAttempt', examAttemptSchema);
module.exports.ATTEMPT_STATUSES = ATTEMPT_STATUSES;
