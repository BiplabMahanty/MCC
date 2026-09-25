const Report = require('../models/Report');
const { queueReport } = require('../queues/reportQueue');
const AppError = require('../utils/AppError');
async function request(instituteId, userId, input) { const report = await Report.create({ instituteId, requestedBy: userId, type: input.type, filters: input.filters || {} }); try { await queueReport(report._id); } catch { await Report.findByIdAndUpdate(report._id, { status: 'failed', error: 'Report queue is unavailable.' }); throw new AppError('Report queue is unavailable.', 503, 'REPORT_QUEUE_UNAVAILABLE'); } return report; }
async function list(instituteId, userId) { return Report.find({ instituteId, requestedBy: userId }).sort({ createdAt: -1 }).limit(50).lean(); }
async function get(instituteId, userId, id) { const report = await Report.findOne({ _id: id, instituteId, requestedBy: userId }).lean(); if (!report) throw new AppError('Report not found.', 404, 'NOT_FOUND'); return report; }
module.exports = { get, list, request };
