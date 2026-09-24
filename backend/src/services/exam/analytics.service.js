const Exam = require('../../models/Exam');
const ExamAttempt = require('../../models/ExamAttempt');
const Result = require('../../models/Result');
const User = require('../../models/User');
const Batch = require('../../models/Batch');
const Subject = require('../../models/Subject');
const AppError = require('../../utils/AppError');
const { ROLES } = require('../../constants/roles');

async function verifyTeacherExamAccess(teacherId, instituteId, examId) {
  const [batchIds, subjectIds] = await Promise.all([
    Batch.find({
      instituteId,
      teacherIds: teacherId,
      isActive: true,
      isDeleted: false,
    }).distinct('_id'),
    Subject.find({
      instituteId,
      teacherIds: teacherId,
      isActive: true,
      isDeleted: false,
    }).distinct('_id'),
  ]);

  const exam = await Exam.findOne({
    _id: examId,
    instituteId,
    isDeleted: false,
    $or: [
      { teacherIds: teacherId },
      { batchId: { $in: batchIds } },
      { subjectId: { $in: subjectIds } },
    ],
  })
    .select('+questions.correctOptionIndex')
    .lean();

  if (!exam) throw new AppError('Exam not found.', 404, 'NOT_FOUND');
  return exam;
}

// ── Monitor: live participation counts ───────────────────────────────────────

async function getExamMonitor(teacherId, instituteId, examId) {
  const exam = await verifyTeacherExamAccess(teacherId, instituteId, examId);

  // All students in the exam's batch
  const totalStudents = await User.countDocuments({
    instituteId,
    role: ROLES.STUDENT,
    'studentProfile.batchId': exam.batchId,
    isActive: true,
    isDeleted: false,
  });

  const [inProgress, submitted, autoSubmitted] = await Promise.all([
    ExamAttempt.countDocuments({ examId, instituteId, status: 'in_progress' }),
    ExamAttempt.countDocuments({ examId, instituteId, status: 'submitted' }),
    ExamAttempt.countDocuments({
      examId,
      instituteId,
      status: 'auto_submitted',
    }),
  ]);

  const started = inProgress + submitted + autoSubmitted;

  return {
    examId,
    examName: exam.name,
    status: exam.status,
    startTime: exam.startTime,
    endTime: exam.endTime,
    totalStudents,
    notStarted: Math.max(0, totalStudents - started),
    inProgress,
    submitted,
    autoSubmitted,
    totalSubmitted: submitted + autoSubmitted,
  };
}

// ── Exam analytics: averages, question-wise, topic-wise ──────────────────────

async function getExamAnalytics(teacherId, instituteId, examId) {
  const exam = await verifyTeacherExamAccess(teacherId, instituteId, examId);

  const results = await Result.find({ examId, instituteId }).lean();

  if (results.length === 0) {
    return {
      examId,
      examName: exam.name,
      totalSubmissions: 0,
      averageMarks: 0,
      averagePercentage: 0,
      highestMarks: 0,
      lowestMarks: 0,
      gradeDistribution: {},
      questionWise: [],
      topicWise: [],
    };
  }

  const marks = results.map((r) => r.obtainedMarks);
  const averageMarks =
    Math.round((marks.reduce((a, b) => a + b, 0) / marks.length) * 100) / 100;
  const averagePercentage =
    Math.round(
      (results.reduce((a, r) => a + r.percentage, 0) / results.length) * 100,
    ) / 100;
  const highestMarks = Math.max(...marks);
  const lowestMarks = Math.min(...marks);

  const gradeDistribution = results.reduce((acc, r) => {
    acc[r.grade] = (acc[r.grade] || 0) + 1;
    return acc;
  }, {});

  // Question-wise accuracy requires attempt answers
  const attempts = await ExamAttempt.find({
    examId,
    instituteId,
    status: { $in: ['submitted', 'auto_submitted'] },
  })
    .select('answers')
    .lean();

  const totalAttempts = attempts.length;
  const questionWise = exam.questions.map((q, i) => {
    let correct = 0;
    let attempted = 0;
    for (const attempt of attempts) {
      const ans = attempt.answers.find((a) => a.questionIndex === i);
      if (
        ans?.selectedOptionIndex !== null &&
        ans?.selectedOptionIndex !== undefined
      ) {
        attempted++;
        if (ans.selectedOptionIndex === q.correctOptionIndex) correct++;
      }
    }
    return {
      index: i,
      topic: q.topic,
      difficulty: q.difficulty,
      attempted,
      correct,
      accuracy:
        attempted > 0 ? Math.round((correct / attempted) * 10000) / 100 : 0,
      skipped: totalAttempts - attempted,
    };
  });

  // Topic-wise aggregation
  const topicMap = {};
  for (const qw of questionWise) {
    if (!topicMap[qw.topic]) {
      topicMap[qw.topic] = { attempted: 0, correct: 0, total: 0 };
    }
    topicMap[qw.topic].total++;
    topicMap[qw.topic].attempted += qw.attempted;
    topicMap[qw.topic].correct += qw.correct;
  }
  const topicWise = Object.entries(topicMap).map(([topic, t]) => ({
    topic,
    totalQuestions: t.total,
    attempted: t.attempted,
    correct: t.correct,
    accuracy:
      t.attempted > 0 ? Math.round((t.correct / t.attempted) * 10000) / 100 : 0,
  }));

  return {
    examId,
    examName: exam.name,
    totalSubmissions: totalAttempts,
    averageMarks,
    averagePercentage,
    highestMarks,
    lowestMarks,
    gradeDistribution,
    questionWise,
    topicWise,
  };
}

module.exports = { getExamAnalytics, getExamMonitor };
