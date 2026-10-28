const Batch = require('../../models/Batch');
const Course = require('../../models/Course');
const Exam = require('../../models/Exam');
const FeeRecord = require('../../models/FeeRecord');
const Notification = require('../../models/Notification');
const Question = require('../../models/Question');
const Schedule = require('../../models/Schedule');
const Subject = require('../../models/Subject');
const User = require('../../models/User');
const { ROLES } = require('../../constants/roles');

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

async function getDashboard(instituteId) {
  const baseFilter = { instituteId, isDeleted: false };
  const [students, teachers, batches, courses, subjects, questions] =
    await Promise.all([
      User.countDocuments({ ...baseFilter, role: ROLES.STUDENT }),
      User.countDocuments({ ...baseFilter, role: ROLES.TEACHER }),
      Batch.countDocuments(baseFilter),
      Course.countDocuments(baseFilter),
      Subject.countDocuments(baseFilter),
      Question.countDocuments(baseFilter),
    ]);

  return { students, teachers, batches, courses, subjects, questions };
}

async function getDashboardHome(instituteId, adminId) {
  const baseFilter = { instituteId, isDeleted: false };
  const now = new Date();
  const todayDay = now.getDay(); // 0=Sun … 6=Sat

  // Current month window
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [
    counts,
    feeAgg,
    pendingStudents,
    todaySchedules,
    upcomingExam,
    unreadCount,
  ] = await Promise.all([
    // 1. stat counts
    Promise.all([
      User.countDocuments({ ...baseFilter, role: ROLES.STUDENT }),
      User.countDocuments({ ...baseFilter, role: ROLES.TEACHER }),
      Batch.countDocuments(baseFilter),
      Course.countDocuments(baseFilter),
      Subject.countDocuments(baseFilter),
      Question.countDocuments(baseFilter),
    ]),

    // 2. fee totals for current month
    FeeRecord.aggregate([
      { $match: { instituteId, dueDate: { $gte: monthStart, $lte: monthEnd } } },
      {
        $group: {
          _id: null,
          totalFees: { $sum: '$amount' },
          totalCollected: { $sum: '$paidAmount' },
        },
      },
    ]),

    // 3. pending fee student count
    FeeRecord.distinct('studentId', {
      instituteId,
      status: { $in: ['pending', 'partial', 'overdue'] },
    }),

    // 4. today's schedules
    Schedule.find({ instituteId, dayOfWeek: todayDay, isDeleted: false, isActive: true })
      .sort({ startTime: 1 })
      .limit(5)
      .populate({ path: 'subjectId', select: 'name' })
      .populate({ path: 'batchId', select: 'name' })
      .lean(),

    // 5. next upcoming published exam
    Exam.findOne({
      instituteId,
      isDeleted: false,
      status: 'published',
      startTime: { $gte: now },
    })
      .sort({ startTime: 1 })
      .populate({ path: 'subjectId', select: 'name' })
      .populate({ path: 'batchId', select: 'name' })
      .lean(),

    // 6. unread notifications for this admin
    Notification.countDocuments({ recipientId: adminId, instituteId, readAt: null }),
  ]);

  const [students, teachers, batches, courses, subjects, questions] = counts;
  const feeRow = feeAgg[0] || { totalFees: 0, totalCollected: 0 };
  const totalCollected = feeRow.totalCollected;
  const totalFees = feeRow.totalFees;
  const pendingAmount = Math.max(0, totalFees - totalCollected);

  const classes = todaySchedules.map((s) => ({
    subject: s.subjectId?.name ?? 'Unknown',
    batch: s.batchId?.name ?? 'Unknown',
    startTime: s.startTime,
    endTime: s.endTime,
    room: s.room || '',
  }));

  return {
    stats: { students, teachers, batches, courses, subjects, questions },
    feeSummary: {
      month: DAY_NAMES[todayDay], // kept for reference; client uses JS Date
      totalCollected,
      pendingAmount,
      totalFees,
      pendingStudents: pendingStudents.length,
    },
    todayClasses: classes,
    upcomingExam: upcomingExam
      ? {
          name: upcomingExam.name,
          subject: upcomingExam.subjectId?.name ?? '',
          batch: upcomingExam.batchId?.name ?? '',
          startTime: upcomingExam.startTime,
          examType: upcomingExam.examType,
        }
      : null,
    unreadNotifications: unreadCount,
  };
}

module.exports = {
  getDashboard,
  getDashboardHome,
};
