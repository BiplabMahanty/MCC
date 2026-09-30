const mongoose = require('mongoose');

const GRADES = ['A+', 'A', 'B', 'C', 'D', 'F'];

function calcGrade(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 75) return 'A';
  if (percentage >= 60) return 'B';
  if (percentage >= 45) return 'C';
  if (percentage >= 33) return 'D';
  return 'F';
}

const resultSchema = new mongoose.Schema(
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
    attemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamAttempt',
      required: true,
      unique: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Score fields (copied from attempt for fast queries)
    totalQuestions: { type: Number, required: true },
    attempted: { type: Number, required: true },
    correct: { type: Number, required: true },
    wrong: { type: Number, required: true },
    unanswered: { type: Number, required: true },
    obtainedMarks: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
    grade: { type: String, enum: GRADES, required: true },
    rank: { type: Number, default: null },
    // Admin controls visibility
    isPublished: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date, default: null },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

resultSchema.index({ examId: 1, obtainedMarks: -1 });
resultSchema.index({ examId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);
module.exports.calcGrade = calcGrade;
module.exports.GRADES = GRADES;
