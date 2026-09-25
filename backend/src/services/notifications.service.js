const Notification = require('../models/Notification');
const User = require('../models/User');
const { queueNotification } = require('../queues/notificationQueue');
const AppError = require('../utils/AppError');
async function announce(instituteId, adminId, input) {
  const recipients = await User.find({ instituteId, role: { $in: input.roles }, isActive: true, isDeleted: false }).select('_id').lean();
  if (!recipients.length) throw new AppError('No active recipients found.', 400, 'NO_RECIPIENTS');
  const documents = recipients.map((recipient) => ({ instituteId, recipientId: recipient._id, title: input.title, body: input.body, type: input.type, createdBy: adminId }));
  const created = await Notification.insertMany(documents);
  await Promise.allSettled(created.map((notification) => queueNotification({ notificationId: String(notification._id) })));
  return { created: created.length };
}
async function mine(userId, instituteId) { return Notification.find({ recipientId: userId, instituteId }).sort({ createdAt: -1 }).limit(100).lean(); }
async function markRead(userId, instituteId, id) { const item = await Notification.findOneAndUpdate({ _id: id, recipientId: userId, instituteId }, { readAt: new Date() }, { new: true }).lean(); if (!item) throw new AppError('Notification not found.', 404, 'NOT_FOUND'); return item; }
module.exports = { announce, markRead, mine };
