import client from './client';

export const listTeachers = (params) =>
  client.get('/admin/teachers', { params }).then((r) => r.data);

export const getTeacher = (id) =>
  client.get(`/admin/teachers/${id}`).then((r) => r.data.data);

export const createTeacher = (body) =>
  client.post('/admin/teachers', body).then((r) => r.data.data);

export const updateTeacher = (id, body) =>
  client.patch(`/admin/teachers/${id}`, body).then((r) => r.data.data);

export const deleteTeacher = (id) =>
  client.delete(`/admin/teachers/${id}`);
