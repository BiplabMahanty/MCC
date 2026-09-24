const Exam = require('../../models/Exam');
const ExamAttempt = require('../../models/ExamAttempt');
const User = require('../../models/User');
const AppError = require('../../utils/AppError');
const { ROLES } = require('../../constants/roles');
const {
  scheduleAutoSubmit,
  cancelAutoSubmit,
} = require('../../queues/examQueue');
const { evaluate } = require('./evaluation.service');
const { createOrUpdateResult } = require('./result.service');

async function getPublishedExam(examId, instituteId) {
  const exam = await Exam.findOne({
    _id: examId,
    instituteId,
    status: 'published',
    isDeleted: false,
  }).lean();

  if (!exam) throw new AppError('Exam not found.', 404, 'NOT_FOUND');
  return exam;
}

async function verifyStudentBatch(studentId, instituteId, batchId) {
  const student = await User.findOne({
    _id: studentId,
    instituteId,
    role: ROLES.STUDENT,
    isActive: true,
    isDeleted: false,
  })
    .select('studentProfile')
    .lean();

  if (!student) throw new AppError('Student not found.', 404, 'NOT_FOUND');

  if (String(student.studentProfile?.batchId) !== String(batchId)) {
    throw new AppError(
      'You are not enrolled in the batch for this exam.',
      403,
      'FORBIDDEN',
    );
  }
}

async function startAttempt(studentId, instituteId, examId) {
  const exam = await getPublishedExam(examId, instituteId);

  await verifyStudentBatch(studentId, instituteId, exam.batchId);

  const now = new Date();
  const examEnd = new Date(exam.endTime);

  if (now > examEnd) {
    throw new AppError('This exam has already ended.', 400, 'EXAM_ENDED');
  }

  // expiresAt = min(startedAt + duration, exam.endTime)
  const durationEnd = new Date(
    now.getTime() + exam.durationMinutes * 60 * 1000,
  );
  const expiresAt = durationEnd < examEnd ? durationEnd : examEnd;

  // Upsert: if attempt already exists return it (idempotent start)
  const existing = await ExamAttempt.findOne({ examId, studentId });
  if (existing) {
    if (existing.status !== 'in_progress') {
      throw new AppError(
        'You have already submitted this exam.',
        409,
        'ALREADY_SUBMITTED',
      );
    }
    return buildAttemptResponse(exam, existing);
  }

  const attempt = await ExamAttempt.create({
    instituteId,
    examId,
    studentId,
    startedAt: now,
    expiresAt,
    answers: [],
  });

  const delayMs = expiresAt.getTime() - Date.now();
  if (delayMs > 0) {
    const jobId = await scheduleAutoSubmit(attempt._id, delayMs);
    attempt.bullmqJobId = jobId;
    await attempt.save();
  }

  return buildAttemptResponse(exam, attempt);
}

async function getAttempt(studentId, instituteId, examId) {
  const exam = await getPublishedExam(examId, instituteId);
  const attempt = await ExamAttempt.findOne({ examId, studentId });

  if (!attempt) throw new AppError('Attempt not started.', 404, 'NOT_FOUND');

  return buildAttemptResponse(exam, attempt);
}

function buildAttemptResponse(exam, attempt) {
  // Strip correct answers — never sent to student
  const questions = exam.questions.map((q) => {
    const copy = { ...q };
    delete copy.correctOptionIndex;
    return copy;
  });

  return {
    attempt: attempt.toJSON ? attempt.toJSON() : attempt,
    exam: {
      _id: exam._id,
      name: exam.name,
      durationMinutes: exam.durationMinutes,
      totalMarks: exam.totalMarks,
      marksPerQuestion: exam.marksPerQuestion,
      negativeMarking: exam.negativeMarking,
      negativeMarks: exam.negativeMarks,
      instructions: exam.instructions,
      startTime: exam.startTime,
      endTime: exam.endTime,
      questions,
    },
    serverTime: new Date().toISOString(),
  };
}

/**
 * Idempotent answer sync.
 * Each answer carries clientTs; older updates never overwrite newer ones.
 */
async function syncAnswers(studentId, examId, incomingAnswers) {
  const attempt = await ExamAttempt.findOne({ examId, studentId });
  if (!attempt) throw new AppError('Attempt not found.', 404, 'NOT_FOUND');
  if (attempt.status !== 'in_progress') {
    throw new AppError('Exam already submitted.', 409, 'ALREADY_SUBMITTED');
  }

  if (new Date() > attempt.expiresAt) {
    throw new AppError('Exam time has expired.', 400, 'EXAM_EXPIRED');
  }

  for (const incoming of incomingAnswers) {
    const existing = attempt.answers.find(
      (a) => a.questionIndex === incoming.questionIndex,
    );

    if (!existing) {
      attempt.answers.push(incoming);
    } else if ((incoming.clientTs || 0) >= (existing.clientTs || 0)) {
      Object.assign(existing, incoming);
    }
  }

  await attempt.save();
  return { synced: true, serverTime: new Date().toISOString() };
}

async function submitAttempt(studentId, examId, isAuto = false) {
  const attempt = await ExamAttempt.findOne({ examId, studentId });
  if (!attempt) throw new AppError('Attempt not found.', 404, 'NOT_FOUND');
  if (attempt.status !== 'in_progress') {
    throw new AppError('Exam already submitted.', 409, 'ALREADY_SUBMITTED');
  }

  // Load exam with correctOptionIndex (bypassing toJSON transform)
  const exam = await Exam.findById(examId)
    .select('+questions.correctOptionIndex')
    .lean();

  if (!exam) throw new AppError('Exam not found.', 404, 'NOT_FOUND');

  const scores = evaluate(exam, attempt.answers);

  attempt.status = isAuto ? 'auto_submitted' : 'submitted';
  attempt.submittedAt = new Date();
  Object.assign(attempt, scores);

  await attempt.save();

  // Cancel the BullMQ job if manual submit beat the timer
  if (!isAuto && attempt.bullmqJobId) {
    await cancelAutoSubmit(attempt._id).catch(() => {});
  }

  // Create/update the Result document and recalc ranks
  await createOrUpdateResult(attempt).catch(() => {});

  return attempt.toJSON();
}

module.exports = { getAttempt, startAttempt, submitAttempt, syncAnswers };
