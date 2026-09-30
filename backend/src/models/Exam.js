const mongoose = require('mongoose');

const EXAM_TYPES = ['practice', 'unit_test', 'mid_term', 'final', 'mock'];
const EXAM_STATUSES = ['draft', 'published', 'cancelled'];

// Snapshot of a question stored at publish time — correct answer hidden from student APIs
const snapshotOptionSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { _id: false },
);

const snapshotQuestionSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
    options: { type: [snapshotOptionSchema], required: true },
    correctOptionIndex: { type: Number, required: true, select: false },
    topic: { type: String, required: true },
    difficulty: { type: String, required: true },
  },
  { _id: false },
);

const examSchema = new mongoose.Schema(
  {
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institute',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    examType: { type: String, enum: EXAM_TYPES, required: true },
    academicSession: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    teacherIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    questionIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
      default: [],
    },
    // Populated at publish time; never modified after publish
    questions: { type: [snapshotQuestionSchema], default: [] },
    durationMinutes: { type: Number, required: true, min: 1, max: 600 },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    totalMarks: { type: Number, required: true, min: 1 },
    marksPerQuestion: { type: Number, required: true, min: 0.5 },
    negativeMarking: { type: Boolean, default: false },
    negativeMarks: { type: Number, default: 0, min: 0 },
    instructions: { type: String, trim: true, maxlength: 3000, default: '' },
    status: {
      type: String,
      enum: EXAM_STATUSES,
      default: 'draft',
      index: true,
    },
    publishedAt: { type: Date, default: null },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, result) {
        delete result.isDeleted;
        delete result.deletedAt;
        delete result.__v;
        // Strip correctOptionIndex from questions array in JSON output
        if (result.questions) {
          result.questions = result.questions.map((q) => {
            const copy = { ...q };
            delete copy.correctOptionIndex;
            return copy;
          });
        }
        return result;
      },
    },
  },
);

examSchema.index({ instituteId: 1, batchId: 1, status: 1, isDeleted: 1 });
examSchema.index({ instituteId: 1, subjectId: 1, status: 1, isDeleted: 1 });
examSchema.index({ instituteId: 1, startTime: 1, status: 1, isDeleted: 1 });

module.exports = mongoose.model('Exam', examSchema);
module.exports.EXAM_TYPES = EXAM_TYPES;
module.exports.EXAM_STATUSES = EXAM_STATUSES;
