const mongoose = require('mongoose');

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const QUESTION_BLOCK_TYPES = ['text', 'formula', 'image', 'table'];
const OPTION_BLOCK_TYPES = ['text', 'formula', 'image'];

const contentBlockSchema = new mongoose.Schema(
  {
    type: { type: String, enum: QUESTION_BLOCK_TYPES, required: true },
    value: { type: String, trim: true },
    url: { type: String, trim: true },
    storageKey: { type: String, trim: true },
    alt: { type: String, trim: true },
    mimeType: { type: String, trim: true },
    width: Number,
    height: Number,
    caption: { type: String, trim: true },
    headers: [{ type: String, trim: true }],
    rows: [[{ type: String, trim: true }]],
  },
  { _id: false },
);

const optionBlockSchema = new mongoose.Schema(
  {
    type: { type: String, enum: OPTION_BLOCK_TYPES, required: true },
    value: { type: String, trim: true },
    url: { type: String, trim: true },
    storageKey: { type: String, trim: true },
    alt: { type: String, trim: true },
    mimeType: { type: String, trim: true },
    width: Number,
    height: Number,
  },
  { _id: false },
);

const optionSchema = new mongoose.Schema(
  {
    content: {
      type: [optionBlockSchema],
      required: true,
      validate: [(value) => value.length > 0, 'Option content is required.'],
    },
  },
  { _id: true },
);

const questionSchema = new mongoose.Schema(
  {
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institute',
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    topic: { type: String, required: true, trim: true, maxlength: 120 },
    difficulty: {
      type: String,
      enum: DIFFICULTIES,
      required: true,
      index: true,
    },
    content: {
      type: [contentBlockSchema],
      required: true,
      validate: [(value) => value.length > 0, 'Question content is required.'],
    },
    options: {
      type: [optionSchema],
      required: true,
      validate: [
        (value) => value.length >= 2 && value.length <= 8,
        'A question must have between 2 and 8 options.',
      ],
    },
    correctOptionIndex: { type: Number, required: true, min: 0 },
    searchText: { type: String, required: true, select: false },
    isActive: { type: Boolean, default: true, index: true },
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
        delete result.searchText;
        delete result.isDeleted;
        delete result.deletedAt;
        delete result.__v;
        return result;
      },
    },
  },
);

function searchableBlock(block) {
  if (block.type === 'table') {
    return [...(block.headers || []), ...(block.rows || []).flat()].join(' ');
  }
  return block.value || block.alt || '';
}

questionSchema.pre('validate', function prepareQuestion() {
  if (this.options && this.correctOptionIndex >= this.options.length) {
    this.invalidate(
      'correctOptionIndex',
      'Correct option must reference an existing option.',
    );
  }

  this.searchText = [
    this.topic,
    ...(this.content || []).map(searchableBlock),
    ...(this.options || []).flatMap((option) =>
      option.content.map(searchableBlock),
    ),
  ]
    .join(' ')
    .toLowerCase();
});

questionSchema.index({ instituteId: 1, searchText: 'text' });
questionSchema.index({
  instituteId: 1,
  subjectId: 1,
  difficulty: 1,
  isActive: 1,
  isDeleted: 1,
  updatedAt: -1,
});

module.exports = mongoose.model('Question', questionSchema);
module.exports.DIFFICULTIES = DIFFICULTIES;
