const mongoose = require('mongoose');
const fileSchema = new mongoose.Schema({ name: String, url: String, storageKey: String, mimeType: String, size: Number }, { _id: false });
const schema = new mongoose.Schema({ instituteId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true }, batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true }, subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true }, title: { type: String, required: true, maxlength: 180 }, description: { type: String, default: '' }, file: { type: fileSchema, required: true }, uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, isDeleted: { type: Boolean, default: false } }, { timestamps: true });
schema.index({ instituteId: 1, batchId: 1, subjectId: 1, isDeleted: 1, createdAt: -1 });
module.exports = mongoose.model('StudyMaterial', schema);
