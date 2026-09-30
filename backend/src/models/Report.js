const mongoose = require('mongoose');
const schema = new mongoose.Schema({ instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true, index: true }, requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, type: { type: String, enum: ['exam', 'fees', 'attendance', 'performance'], required: true }, status: { type: String, enum: ['queued', 'processing', 'completed', 'failed'], default: 'queued' }, filters: { type: mongoose.Schema.Types.Mixed, default: {} }, fileUrl: { type: String, default: null }, error: { type: String, default: null } }, { timestamps: true });
schema.index({ instituteId: 1, requestedBy: 1, createdAt: -1 });
module.exports = mongoose.model('Report', schema);
