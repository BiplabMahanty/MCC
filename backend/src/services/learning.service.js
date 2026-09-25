const Assignment = require('../models/Assignment');
const StudyMaterial = require('../models/StudyMaterial');
const User = require('../models/User');
const AppError = require('../utils/AppError');

async function batchForStudent(studentId, instituteId) {
  const user = await User.findOne({ _id: studentId, instituteId, role: 'student', isActive: true, isDeleted: false }).select('studentProfile.batchId').lean();
  if (!user?.studentProfile?.batchId) throw new AppError('No batch is assigned.', 400, 'BATCH_REQUIRED');
  return user.studentProfile.batchId;
}
async function listStudent(studentId, instituteId) {
  const batchId = await batchForStudent(studentId, instituteId);
  const [assignments, materials] = await Promise.all([
    Assignment.find({ instituteId, batchId, isDeleted: false }).sort({ dueAt: 1 }).lean(),
    StudyMaterial.find({ instituteId, batchId, isDeleted: false }).sort({ createdAt: -1 }).lean(),
  ]);
  return { assignments: assignments.map((item) => ({ ...item, submission: item.submissions.find((submission) => String(submission.studentId) === String(studentId)), submissions: undefined })), materials };
}
async function submit(studentId, instituteId, assignmentId, input) {
  const batchId = await batchForStudent(studentId, instituteId);
  const assignment = await Assignment.findOne({ _id: assignmentId, instituteId, batchId, isDeleted: false });
  if (!assignment) throw new AppError('Assignment not found.', 404, 'NOT_FOUND');
  assignment.submissions = assignment.submissions.filter((item) => String(item.studentId) !== String(studentId));
  assignment.submissions.push({ studentId, files: input.files, note: input.note || '', submittedAt: new Date() });
  await assignment.save();
  return assignment.submissions.at(-1);
}
module.exports = { listStudent, submit };
