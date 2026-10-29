import client from './client';

export const listStudents = (params) =>
  client.get('/admin/students', { params }).then((r) => r.data);

export const getStudent = (id) =>
  client.get(`/admin/students/${id}`).then((r) => r.data.data);

export const createStudent = (body) =>
  client.post('/admin/students', body).then((r) => r.data.data);

export const updateStudent = (id, body) =>
  client.patch(`/admin/students/${id}`, body).then((r) => r.data.data);

export const deleteStudent = (id) =>
  client.delete(`/admin/students/${id}`);

export const getProfileImageUploadUrl = (body) =>
  client.post('/admin/uploads/profile-image', body).then((r) => r.data.data);
