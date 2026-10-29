import client from './client';

export const listAttendance = (params) =>
  client.get('/admin/attendance', { params }).then((r) => r.data.data);

export const markAttendance = (body) =>
  client.put('/admin/attendance', body).then((r) => r.data.data);

export const listBatchStudents = (batchId) =>
  client
    .get('/admin/students', { params: { batchId, isActive: 'true', limit: 200 } })
    .then((r) => r.data.data);
