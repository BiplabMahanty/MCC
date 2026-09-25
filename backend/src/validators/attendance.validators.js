const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid identifier.');
const entry = z.object({
  studentId: objectId,
  status: z.enum(['present', 'absent', 'late', 'excused']),
  note: z.string().trim().max(300).optional(),
});
const markAttendanceSchema = z.object({
  batchId: objectId,
  date: z.coerce.date(),
  entries: z.array(entry).min(1).max(10000),
});
const attendanceQuerySchema = z.object({
  batchId: objectId.optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  date: z.coerce.date().optional(),
});

module.exports = { attendanceQuerySchema, markAttendanceSchema };
