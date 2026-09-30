const mongoose = require('mongoose');
const schema = new mongoose.Schema({ instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true, index: true }, recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, title: { type: String, required: true, maxlength: 160 }, body: { type: String, required: true, maxlength: 2000 }, type: { type: String, enum: ['announcement', 'exam', 'assignment', 'fee', 'result'], default: 'announcement' }, readAt: { type: Date, default: null }, createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null } }, { timestamps: true });
schema.index({ instituteId: 1, recipientId: 1, readAt: 1, createdAt: -1 });
schema.index({ instituteId: 1, type: 1, createdAt: -1 });
module.exports = mongoose.model('Notification', schema);
