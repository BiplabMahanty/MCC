import client from './client';

export const listSubjects = (params) =>
  client.get('/admin/subjects', { params }).then((r) => r.data);

export const createSubject = (body) =>
  client.post('/admin/subjects', body).then((r) => r.data.data);

export const updateSubject = (id, body) =>
  client.patch(`/admin/subjects/${id}`, body).then((r) => r.data.data);

export const deleteSubject = (id) =>
  client.delete(`/admin/subjects/${id}`);
