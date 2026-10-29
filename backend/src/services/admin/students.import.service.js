const { ROLES } = require('../../constants/roles');
const User = require('../../models/User');
const { validateBatch } = require('./assignmentValidation.service');

// Generate a dummy email from name + phone
function generateEmail(name, phone) {
  const namePart = name
    .toLowerCase()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9.]/g, '');
  const phonePart = String(phone).replace(/\D/g, '').slice(-4);
  return `${namePart}.${phonePart}@import.local`;
}

async function importStudents(instituteId, rows) {
  const succeeded = [];
  const failed = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;

    // Basic field validation
    if (!row.name || String(row.name).trim().length < 2) {
      failed.push({ row: rowNum, name: row.name, error: 'name is required (min 2 chars)' });
      continue;
    }
    if (!row.phone || String(row.phone).trim().length === 0) {
      failed.push({ row: rowNum, name: row.name, error: 'phone is required' });
      continue;
    }
    if (!row.studentCode || String(row.studentCode).trim().length === 0) {
      failed.push({ row: rowNum, name: row.name, error: 'studentCode is required' });
      continue;
    }
    if (!row.password || String(row.password).length < 8) {
      failed.push({ row: rowNum, name: row.name, error: 'password is required (min 8 chars)' });
      continue;
    }

    // Validate batchId if provided
    if (row.batchId) {
      try {
        await validateBatch(instituteId, row.batchId);
      } catch {
        failed.push({ row: rowNum, name: row.name, error: `batchId "${row.batchId}" is not a valid active batch` });
        continue;
      }
    }

    const email = generateEmail(String(row.name).trim(), String(row.phone).trim());
    const studentCode = String(row.studentCode).trim().toUpperCase();

    try {
      const user = await User.create({
        instituteId,
        role: ROLES.STUDENT,
        name: String(row.name).trim(),
        email,
        phone: String(row.phone).trim(),
        passwordHash: String(row.password),
        isActive: true,
        studentProfile: {
          studentCode,
          batchId: row.batchId || null,
          guardianName: row.guardianName ? String(row.guardianName).trim() : '',
          guardianPhone: row.guardianPhone ? String(row.guardianPhone).trim() : '',
        },
      });

      succeeded.push({ row: rowNum, name: user.name, email: user.email, studentCode });
    } catch (err) {
      let message = err.message;
      // Friendly duplicate key message
      if (err.code === 11000) {
        const key = Object.keys(err.keyValue || {})[0] || '';
        message = key.includes('studentCode')
          ? `studentCode "${studentCode}" already exists`
          : `email "${email}" already exists (duplicate name+phone)`;
      }
      failed.push({ row: rowNum, name: row.name, error: message });
    }
  }

  return { succeeded, failed, total: rows.length };
}

module.exports = { importStudents };
